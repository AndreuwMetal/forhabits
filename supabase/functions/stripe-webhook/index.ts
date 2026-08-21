// Webhook de Stripe: la ÚNICA fuente de verdad de profiles.is_premium.
//
// Stripe no manda JWT, así que se despliega con `--no-verify-jwt` (y con
// `verify_jwt = false` en config.toml) y la función usa `auth: 'none'`.
// La autenticidad la da exclusivamente la firma del header Stripe-Signature.
import Stripe from 'npm:stripe@^22'
import { withSupabase } from 'npm:@supabase/server@^1'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)
const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

// En Deno la Web Crypto solo es asíncrona: hay que usar este provider junto a
// `constructEventAsync`. La variante síncrona `constructEvent` no funciona.
const cryptoProvider = Stripe.createSubtleCryptoProvider()

/** Estados de suscripción que dan premium. El resto (past_due, unpaid,
 *  canceled, incomplete, paused…) lo quitan. */
const ESTADOS_CON_PREMIUM = new Set(['active', 'trialing'])

/** Stripe movió `current_period_end` del objeto suscripción a cada item. */
function finDePeriodo(sub: Stripe.Subscription): string | null {
  const ts = sub.items?.data?.[0]?.current_period_end ??
    (sub as unknown as { current_period_end?: number }).current_period_end
  return ts ? new Date(ts * 1000).toISOString() : null
}

export default {
  fetch: withSupabase({ auth: 'none' }, async (req, ctx) => {
    const signature = req.headers.get('Stripe-Signature')
    // Hace falta el cuerpo CRUDO: la firma se calcula sobre el texto, no sobre
    // el JSON re-serializado.
    const body = await req.text()

    let event: Stripe.Event
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature!,
        WEBHOOK_SECRET,
        undefined,
        cryptoProvider,
      )
    } catch (err) {
      console.error('firma de Stripe inválida:', err)
      return new Response('firma inválida', { status: 400 })
    }

    const db = ctx.supabaseAdmin

    // Idempotencia: Stripe reintenta cada evento hasta recibir un 2xx. El
    // primer INSERT gana; un reintento choca con la primary key (23505) y sale
    // sin volver a tocar el perfil.
    const { error: registro } = await db.from('stripe_events').insert({ id: event.id })
    if (registro) {
      if (registro.code === '23505') return Response.json({ received: true, repetido: true })
      console.error('no se pudo registrar el evento', event.id, registro)
      return new Response('error registrando el evento', { status: 500 })
    }

    /** Aplica el estado premium buscando el perfil por su stripe_customer_id. */
    const porCliente = async (
      customer: string | { id: string } | null,
      isPremium: boolean,
      until: string | null,
    ) => {
      const customerId = typeof customer === 'string' ? customer : customer?.id
      if (!customerId) throw new Error(`evento ${event.id} sin customer`)
      const { error } = await db
        .from('profiles')
        .update({ is_premium: isPremium, premium_until: until })
        .eq('stripe_customer_id', customerId)
      if (error) throw error
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object
          // metadata la pone create-checkout; client_reference_id es el respaldo.
          const userId = session.metadata?.user_id ?? session.client_reference_id
          if (!userId) throw new Error(`sesión ${session.id} sin user_id`)

          // Suscripción → premium hasta el fin del periodo pagado.
          // Pago único → premium sin caducidad (premium_until = null).
          let until: string | null = null
          if (session.subscription) {
            const subId = typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription.id
            until = finDePeriodo(await stripe.subscriptions.retrieve(subId))
          }

          const customerId = typeof session.customer === 'string'
            ? session.customer
            : session.customer?.id ?? null

          const { error } = await db
            .from('profiles')
            .update({ is_premium: true, premium_until: until, stripe_customer_id: customerId })
            .eq('id', userId)
          if (error) throw error
          break
        }

        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const sub = event.data.object
          const activa = ESTADOS_CON_PREMIUM.has(sub.status)
          await porCliente(sub.customer, activa, activa ? finDePeriodo(sub) : null)
          break
        }

        case 'customer.subscription.deleted': {
          await porCliente(event.data.object.customer, false, null)
          break
        }

        case 'invoice.payment_failed': {
          // El impago acabaría llegando igual como customer.subscription.updated
          // en estado past_due; esto solo corta el acceso antes.
          // ponytail: no distinguimos si la factura pertenece a una suscripción.
          // En este producto los pagos únicos no generan facturas recurrentes,
          // así que el caso no se da; si algún día se diera, habría que mirar
          // `invoice.parent.subscription_details.subscription`.
          await porCliente(event.data.object.customer, false, null)
          break
        }

        default:
          console.log('evento ignorado:', event.type)
      }
    } catch (err) {
      // Borramos el registro de idempotencia para que el reintento de Stripe
      // vuelva a entrar de verdad en lugar de darse por procesado.
      await db.from('stripe_events').delete().eq('id', event.id)
      console.error('fallo procesando', event.type, event.id, err)
      return new Response('error procesando el evento', { status: 500 })
    }

    return Response.json({ received: true })
  }),
}

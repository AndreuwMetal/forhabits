// Crea una Checkout Session de Stripe para el usuario autenticado y devuelve
// { url } para abrirla en el navegador.
//
// `withSupabase({ auth: 'user' })` valida el JWT que Supabase pasa en el header
// Authorization y responde 401 por su cuenta si falta o es inválido; también
// resuelve el CORS. `ctx.supabaseAdmin` es el cliente con service_role.
import Stripe from 'npm:stripe@^22'
import { withSupabase } from 'npm:@supabase/server@^1'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)
const PRICE_ID = Deno.env.get('STRIPE_PRICE_ID')!

// Deep link de vuelta a la app; el scheme `forhabits://` ya está en app.json.
// APP_RETURN_URL es la válvula de escape: si Stripe rechazase un scheme propio,
// se apunta a una página https que redirija al deep link y no se toca código.
const RETURN_URL = Deno.env.get('APP_RETURN_URL') ?? 'forhabits://premium'

export default {
  fetch: withSupabase({ auth: 'user' }, async (_req, ctx) => {
    const userId = ctx.userClaims!.id

    try {
      const { data: profile, error } = await ctx.supabaseAdmin
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single()
      if (error) throw error

      let customerId: string | null = profile.stripe_customer_id
      if (!customerId) {
        // ponytail: sin lock. Dos pulsaciones simultáneas del mismo usuario
        // podrían crear dos clientes en Stripe (el segundo queda huérfano, no
        // rompe nada). Se arreglaría con un update condicional + reintento.
        const customer = await stripe.customers.create({ metadata: { user_id: userId } })
        customerId = customer.id
        await ctx.supabaseAdmin
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('id', userId)
      }

      // El modo se deduce del propio precio en vez de con otra variable de
      // entorno: una llamada extra a Stripe y un secreto menos que configurar.
      // Si el precio es recurrente → suscripción; si es de una vez → pago único.
      const price = await stripe.prices.retrieve(PRICE_ID)
      const mode = price.recurring ? 'subscription' : 'payment'

      const session = await stripe.checkout.sessions.create({
        mode,
        customer: customerId,
        line_items: [{ price: PRICE_ID, quantity: 1 }],
        // Los dos: metadata la lee el webhook, client_reference_id se ve en el
        // dashboard de Stripe y sirve de respaldo.
        metadata: { user_id: userId },
        client_reference_id: userId,
        success_url: `${RETURN_URL}?status=success`,
        cancel_url: `${RETURN_URL}?status=cancel`,
      })

      return Response.json({ url: session.url })
    } catch (err) {
      console.error('create-checkout falló para', userId, err)
      return Response.json({ error: 'no se pudo crear la sesión de pago' }, { status: 500 })
    }
  }),
}

import * as WebBrowser from 'expo-web-browser';
import { hasPayments } from './config';
import { ensureSession, supabase } from './supabase';

export interface CheckoutResult {
  ok: boolean;
  /** el usuario cerró el navegador sin completar el pago: no es un error real */
  cancelled?: boolean;
  error?: string;
}

// El scheme "forhabits" ya está registrado en app.json; el backend usa estos
// mismos deep links como success_url/cancel_url del Checkout de Stripe.
const REDIRECT_URL = 'forhabits://premium';

/** Lanza el checkout de Stripe y, si vuelve con éxito, refresca el estado premium */
export async function startCheckout(): Promise<CheckoutResult> {
  if (!hasPayments || !supabase) {
    return { ok: false, error: 'Los pagos no están configurados en esta build.' };
  }
  try {
    await ensureSession();

    const { data, error } = await supabase.functions.invoke<{ url: string }>('create-checkout');
    if (error || !data?.url) {
      console.warn('create-checkout falló', error);
      return { ok: false, error: 'No se pudo iniciar el pago. Inténtalo de nuevo.' };
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_URL);
    if (result.type !== 'success' || result.url.includes('status=cancel')) {
      return { ok: false, cancelled: true };
    }

    // ponytail: el webhook de Stripe puede tardar un instante en marcar is_premium;
    // si aún no ha llegado, el usuario puede pulsar "Ya he pagado" para reintentar.
    let premium = false;
    try {
      premium = await fetchPremium();
    } catch (e) {
      console.warn('No se pudo confirmar el estado premium tras el pago', e);
    }
    return premium
      ? { ok: true }
      : { ok: false, error: 'Pago recibido, confirmando con el servidor…' };
  } catch (e) {
    console.warn('Fallo al iniciar el checkout', e);
    return { ok: false, error: 'No se pudo completar la compra. Inténtalo de nuevo.' };
  }
}

/**
 * Lee `is_premium`/`premium_until` del perfil y devuelve si el usuario es
 * premium ahora mismo. Lanza si la petición falla (sin red, servidor caído):
 * quien llama decide si mantener el último valor conocido.
 */
export async function fetchPremium(): Promise<boolean> {
  if (!supabase) return false;
  const session = await ensureSession();
  if (!session) return false;

  const { data, error } = await supabase
    .from('profiles')
    .select('is_premium, premium_until')
    .eq('id', session.user.id)
    .single();
  if (error) throw error;
  if (!data?.is_premium) return false;
  if (data.premium_until && new Date(data.premium_until).getTime() < Date.now()) return false;
  return true;
}

import { Linking } from 'react-native';
import { hasPayments } from './config';
import { ensureSession, supabase } from './supabase';

export interface CheckoutResult {
  /** true = se abrió el navegador; el pago se completa fuera de la app */
  ok: boolean;
  error?: string;
}

/**
 * El pago ocurre en la web, no dentro de la app: abrimos el Checkout de Stripe
 * en el navegador del sistema. No podemos esperar el resultado, así que el
 * estado premium se confirma al volver al primer plano (ver store) o con el
 * botón "Ya he pagado".
 */
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

    await Linking.openURL(data.url);
    return { ok: true };
  } catch (e) {
    console.warn('Fallo al abrir el checkout', e);
    return { ok: false, error: 'No se pudo abrir la página de pago. Inténtalo de nuevo.' };
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

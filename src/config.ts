// Variables de entorno públicas (inlineadas en el bundle por Expo, ver
// https://docs.expo.dev/guides/environment-variables/). Todas opcionales:
// sin ellas la app funciona en modo local.
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
export const STRIPE_PRICE_ID = process.env.EXPO_PUBLIC_STRIPE_PRICE_ID;

/** Hay backend cuando están la URL y la clave anónima de Supabase */
export const hasBackend = !!SUPABASE_URL && !!SUPABASE_ANON_KEY;

/** Hay pagos cuando además hay un price id de Stripe para el checkout */
export const hasPayments = hasBackend && !!STRIPE_PRICE_ID;

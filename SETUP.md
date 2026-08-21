# Puesta en producción — ForHabits

## Arranque sin configurar

La app funciona completamente sin claves de Supabase ni Stripe:
- Premium se activa con un botón de desarrollo.
- Los rivales de los retos son simulados en el dispositivo.
- Puedes iterar y enseñar la app así.

En cuanto rellenes las variables de entorno, **se activan automáticamente**:
- Premium real (Stripe Checkout).
- Clasificación en vivo con otros usuarios.

---

## Paso A: Supabase

1. Accede a https://supabase.com/dashboard y crea un proyecto nuevo.
   - Copia el **project ref** (subdominio de la URL del proyecto).
   - Guarda la **contraseña de la base de datos** (la necesitarás en `supabase link`).

2. Ve a **Authentication → Providers** y activa **Anonymous sign-ins**.

3. Ve a **Project Settings → API** y copia:
   - **Project URL**
   - **Anon key** (la clave pública; es segura para el cliente)

---

## Paso B: Stripe

1. Accede al dashboard de Stripe.

2. Ve a **Product catalog**:
   - Crea un producto llamado "ForHabits Premium".
   - Dentro, crea un precio (recurrente o pago único; la función deduce el modo consultando el precio).
   - Copia el **Price ID** (`price_...`).

3. Ve a **Developers → API keys** y copia la **Secret key** (`sk_live_...` o `sk_test_...`).

4. Ve a **Developers → Webhooks** y añade un endpoint:
   - **URL:** `https://<PROJECT_REF>.supabase.co/functions/v1/stripe-webhook`
     - Reemplaza `<PROJECT_REF>` con el subdominio de Supabase.
   - **Eventos:** `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
   - Copia el **Signing secret** (`whsec_...`).

---

## Paso C: Variables de la app

Crea un fichero `.env.local` en la raíz del repo (o edita `.env`, ambos están en `.gitignore`).

Rellena estos valores públicos (se incrustan en el bundle en build time):

| Variable | Valor |
|----------|-------|
| `EXPO_PUBLIC_SUPABASE_URL` | Project URL de Supabase (Paso A, punto 3) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase (Paso A, punto 3) |
| `EXPO_PUBLIC_STRIPE_PRICE_ID` | Price ID de Stripe (Paso B, punto 2) |

Ejemplo:
```
EXPO_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
EXPO_PUBLIC_STRIPE_PRICE_ID=price_1234567890abcdef
```

---

## Paso D: Secretos de las Edge Functions

Estos **NUNCA** van en `.env.local` ni se incrustan en el cliente. Se inyectan solo en las funciones de Supabase.

```bash
supabase login
supabase link --project-ref <PROJECT_REF>
```

Cuando pida contraseña, entra la de la base de datos (Paso A).

Luego, establece los secretos:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
supabase secrets set STRIPE_PRICE_ID=price_xxx
```

Reemplaza `sk_live_xxx`, `whsec_xxx` y `price_xxx` con los valores del Paso B.

---

## Paso E: Despliegue

Desde la raíz del repo:

```bash
supabase db push
```

Sube el esquema de la base de datos (tablas, RLS, etc.).

```bash
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook --no-verify-jwt
```

- `create-checkout` maneja las sesiones de Stripe.
- `stripe-webhook` procesa eventos de Stripe (va con `--no-verify-jwt` porque Stripe no manda JWT; la autenticidad se verifica con la firma del webhook).

---

## Paso F: Comprobación

1. Arranca la app:
   ```bash
   npx expo start
   ```

2. Abre la pestaña **Premium** y pulsa **Hazte Premium**.

3. Completa el checkout de Stripe con la tarjeta de prueba:
   ```
   4242 4242 4242 4242
   Vencimiento: cualquiera en el futuro
   CVC: cualquier número de 3 dígitos
   ```

4. Vuelve a la app. El estado premium debería estar **activo inmediatamente**.

Si no se activa:
- Abre el dashboard de Supabase → **Functions** → `stripe-webhook` y revisa los logs.
- En Stripe, ve a **Developers → Webhooks** → el endpoint que creaste → **Attempts** y comprueba si los eventos se entregaron (status 200) y qué respondió la función.

---

## Avisos

**Apple y Google exigen In-App Purchase (IAP) o Play Billing** para vender contenido digital dentro de la app en sus tiendas. Stripe Checkout es válido en web y para cobrar fuera de la app, pero una build para App Store que venda premium con Stripe puede ser rechazada. Si tu destino es la tienda, habrá que integrar IAP; el código ya soporta múltiples orígenes de premium porque la columna `profiles.is_premium` está en el servidor.

**Variable opcional `APP_RETURN_URL`** (por defecto `forhabits://premium`): si Stripe rechaza el custom scheme, publica una página HTTPS que redirija a `forhabits://premium` y ejecuta:
```bash
supabase secrets set APP_RETURN_URL=https://tudominio.com/return
```
No hay que tocar el código.

**`supabase/.temp/`** se genera con `supabase link` y ya está en `.gitignore`.

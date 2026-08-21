import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type Session } from '@supabase/supabase-js';
import { hasBackend, SUPABASE_ANON_KEY, SUPABASE_URL } from './config';

// Cliente solo si hay configuración; los consumidores comprueban `supabase !== null`.
export const supabase = hasBackend
  ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

// ponytail: lista propia en vez de importar los nombres/avatares de challenges.ts
// (no están exportados y ese fichero es de otro agente); si algún día se exportan,
// esto puede sustituirse por un import compartido. Sin sufijo "(demo)": son usuarios reales.
const PUBLIC_NAMES = [
  'Lucía', 'Marco', 'Noa', 'Kenji', 'Aisha', 'Bruno', 'Elena', 'Iván',
  'Mara', 'Théo', 'Sofía', 'Óscar', 'Nadia', 'Hugo', 'Irene', 'Diego',
];
const PUBLIC_INITIALS = 'ABCDEFGHIJKLMNPRSTVZ';
const PUBLIC_AVATARS = ['🦊', '🐼', '🦉', '🐢', '🦁', '🐝', '🐳', '🦩', '🐙', '🦄'];

function randomDisplayName(): string {
  const name = PUBLIC_NAMES[Math.floor(Math.random() * PUBLIC_NAMES.length)];
  const initial = PUBLIC_INITIALS[Math.floor(Math.random() * PUBLIC_INITIALS.length)];
  return `${name} ${initial}.`;
}

function randomAvatar(): string {
  return PUBLIC_AVATARS[Math.floor(Math.random() * PUBLIC_AVATARS.length)];
}

let sessionPromise: Promise<Session | null> | null = null;

/**
 * Devuelve la sesión activa o crea una anónima (no hay pantalla de login).
 * Idempotente y a prueba de llamadas concurrentes: comparte la misma promesa
 * en vuelo. Si algo falla (sin red, proyecto caído) degrada a `null` en
 * silencio para que la app siga funcionando en modo local.
 */
export function ensureSession(): Promise<Session | null> {
  if (!supabase) return Promise.resolve(null);
  if (!sessionPromise) {
    sessionPromise = createOrRestoreSession().catch((e) => {
      console.warn('No se pudo iniciar sesión anónima', e);
      sessionPromise = null; // permite reintentar en la próxima llamada
      return null;
    });
  }
  return sessionPromise;
}

async function createOrRestoreSession(): Promise<Session | null> {
  if (!supabase) return null;

  const {
    data: { session: existing },
  } = await supabase.auth.getSession();
  if (existing) return existing;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.session) {
    console.warn('No se pudo crear la sesión anónima', error);
    return null;
  }

  // primer arranque: nombre público corto generado en el dispositivo
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ display_name: randomDisplayName(), avatar: randomAvatar() })
    .eq('id', data.user!.id);
  if (profileError) console.warn('No se pudo inicializar el perfil', profileError);

  return data.session;
}

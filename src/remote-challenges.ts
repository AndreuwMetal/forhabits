// Acceso a Supabase para la bolsa de retos: todo lo que toca red vive aquí,
// para que src/challenges.ts siga siendo lógica pura sin dependencias.
//
// Contrato (ver supabase/migrations/20260821090000_premium.sql):
//   challenge_entries(user_id, challenge_id, habit_name, habit_emoji,
//     display_name, avatar, started_at, done_days, total_days, updated_at)
//   único (user_id, challenge_id); done_days <= total_days.
//
// Toda función es no-op segura: sin backend, sin sesión o con fallo de red
// devuelve null (o []) en vez de lanzar, para que la UI caiga a la cohorte
// simulada de challenges.ts.
import type { Habit } from './types';
import { ensureSession, supabase } from './supabase';
import {
  ActiveChallenge,
  ChallengeDef,
  RankEntry,
  compareEntries,
} from './challenges';

export async function joinRemote(
  active: ActiveChallenge,
  def: ChallengeDef,
  habit: Habit
): Promise<null> {
  if (!supabase) return null;
  const session = await ensureSession();
  if (!session) return null;
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('display_name, avatar')
      .eq('id', session.user.id)
      .single();
    if (profileError || !profile) {
      console.warn('No se pudo leer el perfil para entrar al reto', profileError);
      return null;
    }
    const { error } = await supabase.from('challenge_entries').upsert(
      {
        user_id: session.user.id,
        challenge_id: def.id,
        habit_name: habit.name,
        habit_emoji: habit.emoji,
        display_name: profile.display_name,
        avatar: profile.avatar,
        started_at: active.startedAt,
        done_days: 0,
        total_days: def.days,
      },
      { onConflict: 'user_id,challenge_id' }
    );
    if (error) console.warn('No se pudo apuntar al reto en el servidor', error);
  } catch (e) {
    console.warn('No se pudo apuntar al reto en el servidor', e);
  }
  return null;
}

export async function syncProgress(
  active: ActiveChallenge,
  def: ChallengeDef,
  doneDays: number
): Promise<null> {
  if (!supabase) return null;
  const session = await ensureSession();
  if (!session) return null;
  try {
    // recortado a total_days: la BD lo rechazaría igualmente por el check,
    // pero así evitamos el viaje de red que sabemos que va a fallar.
    const { error } = await supabase
      .from('challenge_entries')
      .update({ done_days: Math.min(doneDays, def.days) })
      .eq('user_id', session.user.id)
      .eq('challenge_id', def.id);
    if (error) console.warn('No se pudo sincronizar el progreso del reto', error);
  } catch (e) {
    console.warn('No se pudo sincronizar el progreso del reto', e);
  }
  return null;
}

export async function leaveRemote(challengeId: string): Promise<null> {
  if (!supabase) return null;
  const session = await ensureSession();
  if (!session) return null;
  try {
    const { error } = await supabase
      .from('challenge_entries')
      .delete()
      .eq('user_id', session.user.id)
      .eq('challenge_id', challengeId);
    if (error) console.warn('No se pudo abandonar el reto en el servidor', error);
  } catch (e) {
    console.warn('No se pudo abandonar el reto en el servidor', e);
  }
  return null;
}

/**
 * Clasificación real desde el servidor, con la misma forma que buildRanking().
 * `null` significa "no se pudo obtener": la UI debe caer a la simulación.
 */
export async function fetchRanking(def: ChallengeDef): Promise<RankEntry[] | null> {
  if (!supabase) return null;
  const session = await ensureSession();
  if (!session) return null;
  try {
    const { data, error } = await supabase
      .from('challenge_entries')
      .select('user_id, display_name, avatar, done_days')
      .eq('challenge_id', def.id);
    if (error || !data) {
      console.warn('No se pudo cargar la clasificación del reto', error);
      return null;
    }
    const uid = session.user.id;
    const entries: RankEntry[] = data.map((row) => ({
      id: row.user_id,
      name: row.user_id === uid ? '' : row.display_name,
      emoji: row.avatar,
      done: row.done_days,
      isUser: row.user_id === uid,
    }));
    return entries.sort(compareEntries);
  } catch (e) {
    console.warn('No se pudo cargar la clasificación del reto', e);
    return null;
  }
}

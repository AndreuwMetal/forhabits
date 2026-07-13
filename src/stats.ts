import { Habit, Logs, addDays, isDueOn, toKey } from './types';

/** Progreso de hoy: hábitos completados / hábitos que tocan hoy */
export function todayProgress(habits: Habit[], logs: Logs): { done: number; total: number } {
  const today = new Date();
  const key = toKey(today);
  const due = habits.filter((h) => isDueOn(h, today));
  const log = logs[key] ?? {};
  const done = due.filter((h) => log[h.id] === true).length;
  return { done, total: due.length };
}

/**
 * Racha actual: días consecutivos (terminando hoy o ayer) en los que se
 * completaron TODOS los hábitos programados. Los días sin hábitos
 * programados no rompen la racha.
 */
export function currentStreak(habits: Habit[], logs: Logs): number {
  if (habits.length === 0) return 0;
  let streak = 0;
  let d = new Date();

  const dayComplete = (date: Date): 'complete' | 'incomplete' | 'none' => {
    const due = habits.filter((h) => isDueOn(h, date));
    if (due.length === 0) return 'none';
    const log = logs[toKey(date)] ?? {};
    return due.every((h) => log[h.id] === true) ? 'complete' : 'incomplete';
  };

  // hoy aún puede estar a medias: si no está completo, la racha empieza ayer
  const todayState = dayComplete(d);
  if (todayState === 'complete') streak++;
  d = addDays(d, -1);

  for (let i = 0; i < 3650; i++) {
    const state = dayComplete(d);
    if (state === 'incomplete') break;
    if (state === 'complete') streak++;
    d = addDays(d, -1);
  }
  return streak;
}

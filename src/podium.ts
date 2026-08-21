// Lógica pura del podio de rachas por hábito. Sin dependencias de React Native
// para poder ejecutarse (y testearse) directamente en Node.
import { type Habit, type Logs, addDays, isDueOn, toKey } from './types';

const MAX_DAYS = 3650;

/** Estado de un día concreto para UN hábito: si tocaba, y si se cumplió. */
function dayState(habit: Habit, logs: Logs, date: Date): 'complete' | 'incomplete' | 'none' {
  if (!isDueOn(habit, date)) return 'none';
  const log = logs[toKey(date)] ?? {};
  return log[habit.id] === true ? 'complete' : 'incomplete';
}

/**
 * Racha actual de un hábito: días consecutivos hacia atrás en los que estaba
 * programado y se completó. Los días no programados no rompen la racha.
 * Igual que currentStreak en stats.ts pero por hábito: si hoy toca y no está
 * registrado aún, la racha se cuenta desde ayer.
 */
export function habitStreak(habit: Habit, logs: Logs): number {
  let streak = 0;
  let d = new Date();

  const todayState = dayState(habit, logs, d);
  if (todayState === 'complete') streak++;
  d = addDays(d, -1);

  for (let i = 0; i < MAX_DAYS; i++) {
    const state = dayState(habit, logs, d);
    if (state === 'incomplete') break;
    if (state === 'complete') streak++;
    d = addDays(d, -1);
  }
  return streak;
}

/**
 * Mejor racha histórica de un hábito desde su creación hasta hoy, con el
 * mismo criterio que habitStreak (días no programados no cuentan ni rompen).
 */
export function bestStreak(habit: Habit, logs: Logs): number {
  const created = new Date(habit.createdAt);
  created.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let best = 0;
  let running = 0;
  let d = created;
  let guard = 0;
  while (d <= today && guard < MAX_DAYS) {
    const state = dayState(habit, logs, d);
    if (state === 'complete') {
      running++;
      if (running > best) best = running;
    } else if (state === 'incomplete') {
      running = 0;
    }
    // 'none': no altera la racha en curso
    d = addDays(d, 1);
    guard++;
  }
  return best;
}

export interface PodiumEntry {
  habit: Habit;
  current: number;
  best: number;
}

/**
 * Ordena los hábitos por racha actual desc, desempatando por mejor racha
 * desc y luego por nombre.
 */
export function podium(habits: Habit[], logs: Logs): PodiumEntry[] {
  return habits
    .map((habit) => ({ habit, current: habitStreak(habit, logs), best: bestStreak(habit, logs) }))
    .sort((a, b) => {
      if (b.current !== a.current) return b.current - a.current;
      if (b.best !== a.best) return b.best - a.best;
      return a.habit.name.localeCompare(b.habit.name);
    });
}

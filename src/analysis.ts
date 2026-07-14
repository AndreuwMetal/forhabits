import { Habit, Logs, addDays, fromKey, isDueOn, toKey } from './types';

export type AnalysisMode = 'weekly' | 'monthly';

export interface HabitStat {
  habit: Habit;
  /** días en los que tocaba el hábito dentro del periodo */
  due: number;
  /** días en los que se completó */
  done: number;
  /** calificación 0-10 por regla de tres (done/due × 10), 1 decimal */
  grade: number;
}

export interface Analysis {
  mode: AnalysisMode;
  start: Date;
  end: Date;
  stats: HabitStat[];
  totalDue: number;
  totalDone: number;
  /** proporción de cumplimiento 0-1 */
  ratio: number;
  /** días evaluados del periodo */
  days: number;
  /** mejora conseguida: ratio × 1% diario × días (1 decimal) */
  improvementPct: number;
  /** mejora objetivo: 1% × días (7% en una semana completa) */
  goalPct: number;
}

/**
 * Construye el análisis del periodo que termina en el domingo dado.
 * weekly: lunes→domingo de esa semana. monthly: día 1 del mes → ese domingo.
 * Solo se evalúan días ya transcurridos (≤ hoy).
 */
export function buildAnalysis(
  habits: Habit[],
  logs: Logs,
  mode: AnalysisMode,
  sundayKey: string
): Analysis {
  const sunday = fromKey(sundayKey);
  const start =
    mode === 'weekly'
      ? addDays(sunday, -6)
      : new Date(sunday.getFullYear(), sunday.getMonth(), 1);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const end = sunday <= today ? sunday : today;

  const stats: HabitStat[] = habits.map((habit) => {
    let due = 0;
    let done = 0;
    for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
      if (!isDueOn(habit, d)) continue;
      due++;
      if (logs[toKey(d)]?.[habit.id] === true) done++;
    }
    const grade = due === 0 ? 0 : Math.round((done / due) * 100) / 10;
    return { habit, due, done, grade };
  });

  const totalDue = stats.reduce((s, x) => s + x.due, 0);
  const totalDone = stats.reduce((s, x) => s + x.done, 0);
  const ratio = totalDue === 0 ? 0 : totalDone / totalDue;
  const days = Math.max(
    0,
    Math.round((end.getTime() - start.getTime()) / 86400000) + 1
  );
  const goalPct = days; // 1% por día
  const improvementPct = Math.round(ratio * days * 10) / 10;

  return {
    mode,
    start,
    end: sunday,
    stats,
    totalDue,
    totalDone,
    ratio,
    days,
    improvementPct,
    goalPct,
  };
}

export function isSunday(d: Date): boolean {
  return d.getDay() === 0;
}

/** ¿Es el último domingo de su mes? */
export function isLastSundayOfMonth(d: Date): boolean {
  if (d.getDay() !== 0) return false;
  const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return d.getDate() + 7 > daysInMonth;
}

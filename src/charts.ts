// Agregaciones puras para las gráficas de seguimiento premium.
// Sin imports de react/react-native: debe poder ejecutarse en Node (ver charts.check.ts).
import { type Habit, type Logs, addDays, isDueOn, toKey } from './types';

/** Punto de la serie diaria de cumplimiento */
export interface DayPoint {
  dateKey: string;
  due: number;
  done: number;
  /** null cuando due === 0 (sin hábitos programados ese día): no cuenta en las medias */
  pct: number | null;
}

/** Cumplimiento acumulado de un hábito en el rango */
export interface HabitPoint {
  habit: Habit;
  due: number;
  done: number;
  pct: number | null;
}

/** Cumplimiento acumulado por día de la semana (0 = lunes ... 6 = domingo, como WEEKDAY_LETTERS) */
export interface WeekdayPoint {
  weekday: number;
  due: number;
  done: number;
  pct: number | null;
}

function pctOf(done: number, due: number): number | null {
  return due === 0 ? null : Math.round((done / due) * 100);
}

/** Normaliza a medianoche local, sin mutar la fecha recibida */
function atMidnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** [start, end] (ambos inclusive) de los últimos `days` días hasta `today` */
function rangeOf(days: number, today: Date): { start: Date; end: Date } {
  const end = atMidnight(today);
  const start = addDays(end, -(Math.max(1, days) - 1));
  return { start, end };
}

/** Serie diaria de cumplimiento: uno por día del rango, del más antiguo al más reciente */
export function dailySeries(habits: Habit[], logs: Logs, days: number, today: Date = new Date()): DayPoint[] {
  const { start, end } = rangeOf(days, today);
  const points: DayPoint[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) {
    let due = 0;
    let done = 0;
    const dayLog = logs[toKey(d)];
    for (const h of habits) {
      if (!isDueOn(h, d)) continue;
      due++;
      if (dayLog?.[h.id] === true) done++;
    }
    points.push({ dateKey: toKey(d), due, done, pct: pctOf(done, due) });
  }
  return points;
}

/** Cumplimiento por hábito en el rango */
export function habitCompletion(habits: Habit[], logs: Logs, days: number, today: Date = new Date()): HabitPoint[] {
  const { start, end } = rangeOf(days, today);
  return habits.map((habit) => {
    let due = 0;
    let done = 0;
    for (let d = start; d <= end; d = addDays(d, 1)) {
      if (!isDueOn(habit, d)) continue;
      due++;
      if (logs[toKey(d)]?.[habit.id] === true) done++;
    }
    return { habit, due, done, pct: pctOf(done, due) };
  });
}

/** Cumplimiento por día de la semana en el rango (lunes primero) */
export function weekdayCompletion(habits: Habit[], logs: Logs, days: number, today: Date = new Date()): WeekdayPoint[] {
  const { start, end } = rangeOf(days, today);
  const due = new Array(7).fill(0);
  const done = new Array(7).fill(0);
  for (let d = start; d <= end; d = addDays(d, 1)) {
    const idx = (d.getDay() + 6) % 7; // getDay(): 0=domingo -> reindexa a 0=lunes
    const dayLog = logs[toKey(d)];
    for (const h of habits) {
      if (!isDueOn(h, d)) continue;
      due[idx]++;
      if (dayLog?.[h.id] === true) done[idx]++;
    }
  }
  return due.map((dueCount, idx) => ({
    weekday: idx,
    due: dueCount,
    done: done[idx],
    pct: pctOf(done[idx], dueCount),
  }));
}

/** Media de los pct no nulos de un conjunto de puntos (ignora los días/hábitos sin datos) */
export function averagePct(points: { pct: number | null }[]): number | null {
  const values = points.map((p) => p.pct).filter((v): v is number => v !== null);
  if (values.length === 0) return null;
  return Math.round(values.reduce((s, v) => s + v, 0) / values.length);
}

/** Media global del rango: proporción done/due total (ponderada por número de hábitos programados) */
export function rangeAverage(habits: Habit[], logs: Logs, days: number, today: Date = new Date()): number | null {
  const series = dailySeries(habits, logs, days, today);
  const totalDue = series.reduce((s, p) => s + p.due, 0);
  const totalDone = series.reduce((s, p) => s + p.done, 0);
  return pctOf(totalDone, totalDue);
}

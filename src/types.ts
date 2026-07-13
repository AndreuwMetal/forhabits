export type Periodicity =
  | { type: 'daily' }
  | { type: 'weekdays'; days: number[] }; // 0 = domingo ... 6 = sábado

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  periodicity: Periodicity;
  createdAt: string; // ISO
  /** hora preferida opcional, ej. "07:30" */
  time?: string;
  /** lugar preferido opcional, ej. "el parque" */
  place?: string;
  /** anotaciones libres del usuario */
  notes?: string;
}

/** Registro de un día: habitId -> completado o no */
export type DayLog = Record<string, boolean>;

/** Todos los registros: 'YYYY-MM-DD' -> DayLog */
export type Logs = Record<string, DayLog>;

export function isDueOn(habit: Habit, date: Date): boolean {
  const created = new Date(habit.createdAt);
  created.setHours(0, 0, 0, 0);
  if (date < created) return false;
  const p = habit.periodicity;
  if (p.type === 'daily') return true;
  return p.days.includes(date.getDay());
}

export function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateEs(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

/** Diferencia en meses entre el primer día de a y el primer día de b */
export function monthDiff(a: Date, b: Date): number {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}

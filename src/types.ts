export type Periodicity =
  | { type: 'daily' }
  | { type: 'weekdays'; days: number[] }; // 0 = domingo ... 6 = sábado

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  periodicity: Periodicity;
  createdAt: string; // ISO
}

/** Registro de un día: habitId -> completado o no */
export type DayLog = Record<string, boolean>;

/** Todos los registros: 'YYYY-MM-DD' -> DayLog */
export type Logs = Record<string, DayLog>;

const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function periodicityLabel(p: Periodicity): string {
  if (p.type === 'daily') return 'Todos los días';
  if (p.days.length === 7) return 'Todos los días';
  if (p.days.length === 0) return 'Sin días asignados';
  const sorted = [...p.days].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)); // lunes primero
  return sorted.map((d) => WEEKDAY_LABELS[d]).join(', ');
}

export function isDueOn(habit: Habit, date: Date): boolean {
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

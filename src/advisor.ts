import { INVERSE_LAWS, LAWS, Law, Strategy } from './knowledge';

export type AdviceMode = 'build' | 'break';

export interface AdviceItem {
  strategy: Strategy;
  applied: string; // plantilla con el hábito insertado
  example: string; // ejemplo práctico con el hábito insertado
}

export interface LawAdvice {
  law: Law;
  items: AdviceItem[];
}

export interface HabitContext {
  /** hora registrada del hábito, sustituye [HORA] */
  time?: string;
  /** lugar registrado del hábito, sustituye [LUGAR] */
  place?: string;
}

function normalizeHabit(raw: string): string {
  const t = raw.trim().replace(/\s+/g, ' ');
  if (!t) return t;
  return t.charAt(0).toLowerCase() + t.slice(1);
}

function fill(template: string, habit: string, ctx: HabitContext): string {
  let out = template.split('{habit}').join(habit);
  if (ctx.time) out = out.split('[HORA]').join(ctx.time);
  if (ctx.place) out = out.split('[LUGAR]').join(ctx.place);
  return out;
}

export function buildAdvice(
  habitName: string,
  mode: AdviceMode,
  ctx: HabitContext = {}
): LawAdvice[] {
  const habit = normalizeHabit(habitName);
  const laws = mode === 'build' ? LAWS : INVERSE_LAWS;
  return laws.map((law) => ({
    law,
    items: law.strategies.map((strategy) => ({
      strategy,
      applied: fill(strategy.template, habit, ctx),
      example: fill(strategy.example, habit, ctx),
    })),
  }));
}

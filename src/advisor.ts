import { INVERSE_LAWS, LAWS, Law, Strategy } from './knowledge';

export type AdviceMode = 'build' | 'break';

export interface AdviceItem {
  strategy: Strategy;
  applied: string; // plantilla con el hábito insertado
}

export interface LawAdvice {
  law: Law;
  items: AdviceItem[];
}

function normalizeHabit(raw: string): string {
  const t = raw.trim().replace(/\s+/g, ' ');
  if (!t) return t;
  return t.charAt(0).toLowerCase() + t.slice(1);
}

export function buildAdvice(habitName: string, mode: AdviceMode): LawAdvice[] {
  const habit = normalizeHabit(habitName);
  const laws = mode === 'build' ? LAWS : INVERSE_LAWS;
  return laws.map((law) => ({
    law,
    items: law.strategies.map((strategy) => ({
      strategy,
      applied: strategy.template.split('{habit}').join(habit),
    })),
  }));
}

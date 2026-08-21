import { type Logs, addDays, toKey } from './types';

// Lógica pura de la bolsa de retos: sin React ni React Native, para poder
// ejecutar el self-check en Node.

export type ChallengeLang = 'es' | 'en';

export interface ChallengeDef {
  id: string;
  emoji: string;
  /** los títulos viven aquí, no en i18n: son contenido del catálogo */
  title: Record<ChallengeLang, string>;
  /** duración del reto en días */
  days: number;
  /** participantes totales, incluyéndote a ti */
  participants: number;
}

/** Reto en el que el usuario está dentro ahora mismo */
export interface ActiveChallenge {
  challengeId: string;
  habitId: string;
  /** ISO del momento en que entró */
  startedAt: string;
}

export interface RankEntry {
  id: string;
  /** vacío para el usuario: la UI pone t('challengeYou') */
  name: string;
  emoji: string;
  done: number;
  isUser: boolean;
}

export const CHALLENGES_KEY = 'forhabits.challenges.v1';

export const CHALLENGES: ChallengeDef[] = [
  {
    id: 'read21',
    emoji: '📚',
    title: { es: '21 días de lectura', en: '21 days of reading' },
    days: 21,
    participants: 24,
  },
  {
    id: 'move30',
    emoji: '🏃',
    title: { es: '30 días en movimiento', en: '30 days on the move' },
    days: 30,
    participants: 32,
  },
  {
    id: 'water14',
    emoji: '💧',
    title: { es: '14 días bien hidratado', en: '14 days well hydrated' },
    days: 14,
    participants: 18,
  },
  {
    id: 'sleep21',
    emoji: '😴',
    title: { es: '21 noches de sueño temprano', en: '21 nights of early sleep' },
    days: 21,
    participants: 16,
  },
  {
    id: 'calm30',
    emoji: '🧘',
    title: { es: '30 días de calma', en: '30 days of calm' },
    days: 30,
    participants: 21,
  },
  {
    id: 'nosugar7',
    emoji: '🍭',
    title: { es: '7 días sin azúcar', en: '7 days without sugar' },
    days: 7,
    participants: 28,
  },
];

export function findChallenge(id: string): ChallengeDef | undefined {
  return CHALLENGES.find((c) => c.id === id);
}

export function challengeTitle(def: ChallengeDef, lang: ChallengeLang): string {
  return def.title[lang];
}

// ── cohorte simulada ────────────────────────────────────────────────────────

/** FNV-1a de 32 bits: barato y estable entre plataformas */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const NAMES = [
  'Lucía', 'Marco', 'Noa', 'Kenji', 'Aisha', 'Bruno', 'Elena', 'Iván',
  'Mara', 'Théo', 'Sofía', 'Óscar', 'Nadia', 'Hugo', 'Irene', 'Diego',
  'Yara', 'Pablo', 'Leila', 'Tomás', 'Greta', 'Adrián', 'Nuria', 'Emil',
];
const INITIALS = 'ABCDEFGHIJKLMNPRSTVZ';
const AVATARS = ['🦊', '🐼', '🦉', '🐢', '🦁', '🐝', '🐳', '🦩', '🐙', '🦄'];

/** Sufijo obligatorio: estos participantes no son personas reales */
export const DEMO_SUFFIX = '(demo)';

export function simulatedName(challengeId: string, index: number): string {
  const h = hashString(`${challengeId}#name#${index}`);
  const first = NAMES[h % NAMES.length];
  const initial = INITIALS[(h >>> 9) % INITIALS.length];
  return `${first} ${initial}. ${DEMO_SUFFIX}`;
}

export function simulatedAvatar(challengeId: string, index: number): string {
  return AVATARS[hashString(`${challengeId}#face#${index}`) % AVATARS.length];
}

/**
 * Días completados por un rival tras `elapsedDays`. Se tira una "moneda"
 * determinista por día contra la constancia del rival, así el progreso avanza
 * de forma plausible y dos renders del mismo día dan el mismo número.
 *
 * ponytail: constancia fija por rival, sin rachas ni abandonos; el techo es que
 * todos avanzan de forma uniforme. Cuando haya servidor, esto se sustituye por
 * el progreso real de la cohorte en lugar de refinar la simulación.
 */
export function rivalCompletedDays(
  challengeId: string,
  index: number,
  elapsedDays: number
): number {
  if (elapsedDays <= 0) return 0;
  const rate = 40 + (hashString(`${challengeId}#rate#${index}`) % 59); // 40..98 %
  let done = 0;
  for (let d = 0; d < elapsedDays; d++) {
    if (hashString(`${challengeId}#${index}#${d}`) % 100 < rate) done++;
  }
  return done;
}

// ── progreso del usuario ────────────────────────────────────────────────────

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Días naturales completos entre dos fechas (redondeo, inmune al horario de verano) */
export function daysBetween(a: Date, b: Date): number {
  return Math.round(
    (startOfDay(b).getTime() - startOfDay(a).getTime()) / 86400000
  );
}

/** Días transcurridos desde el inicio, sin recortar: 1 el primer día */
export function elapsedDays(startedAt: string, today: Date = new Date()): number {
  return daysBetween(new Date(startedAt), today) + 1;
}

/** Día actual del reto, recortado a [1, days] */
export function challengeDayIndex(
  startedAt: string,
  days: number,
  today: Date = new Date()
): number {
  return Math.min(days, Math.max(1, elapsedDays(startedAt, today)));
}

export function isFinished(
  startedAt: string,
  days: number,
  today: Date = new Date()
): boolean {
  return elapsedDays(startedAt, today) > days;
}

/** Días en los que el hábito vinculado quedó marcado dentro de la ventana del reto */
export function userCompletedDays(
  logs: Logs,
  habitId: string,
  startedAt: string,
  days: number,
  today: Date = new Date()
): number {
  const start = startOfDay(new Date(startedAt));
  const window = challengeDayIndex(startedAt, days, today);
  let done = 0;
  for (let d = 0; d < window; d++) {
    if (logs[toKey(addDays(start, d))]?.[habitId] === true) done++;
  }
  return done;
}

// ── clasificación ───────────────────────────────────────────────────────────

/** Más días primero; a igualdad, tú por delante y los rivales por id */
export function compareEntries(a: RankEntry, b: RankEntry): number {
  if (a.done !== b.done) return b.done - a.done;
  if (a.isUser !== b.isUser) return a.isUser ? -1 : 1;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

export function buildRanking(
  def: ChallengeDef,
  active: ActiveChallenge,
  logs: Logs,
  today: Date = new Date()
): RankEntry[] {
  const window = challengeDayIndex(active.startedAt, def.days, today);
  const entries: RankEntry[] = [
    {
      id: 'you',
      name: '',
      emoji: '⭐',
      done: userCompletedDays(logs, active.habitId, active.startedAt, def.days, today),
      isUser: true,
    },
  ];
  for (let i = 0; i < def.participants - 1; i++) {
    entries.push({
      id: `${def.id}#${i}`,
      name: simulatedName(def.id, i),
      emoji: simulatedAvatar(def.id, i),
      done: rivalCompletedDays(def.id, i, window),
      isUser: false,
    });
  }
  return entries.sort(compareEntries);
}

/** Primeros `limit` puestos, añadiendo tu fila si te has quedado fuera */
export function topWithUser(entries: RankEntry[], limit: number): RankEntry[] {
  const top = entries.slice(0, limit);
  if (top.some((e) => e.isUser)) return top;
  const you = entries.find((e) => e.isUser);
  return you ? [...top, you] : top;
}

export function medalFor(position: number): string {
  return ['🥇', '🥈', '🥉'][position] ?? '';
}

export function userPosition(entries: RankEntry[]): number {
  return entries.findIndex((e) => e.isUser) + 1;
}

// ── persistencia ────────────────────────────────────────────────────────────

/** Descarta lo que no cuadre: el JSON viene de disco y puede ser de otra versión */
export function parseActive(raw: string | null): ActiveChallenge[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (x): x is ActiveChallenge =>
        !!x &&
        typeof x === 'object' &&
        typeof (x as ActiveChallenge).challengeId === 'string' &&
        typeof (x as ActiveChallenge).habitId === 'string' &&
        typeof (x as ActiveChallenge).startedAt === 'string' &&
        !!findChallenge((x as ActiveChallenge).challengeId)
    );
  } catch {
    return [];
  }
}

/** "Día {n} de {total}" con los marcadores de i18n sustituidos */
export function fillDayOf(template: string, n: number, total: number): string {
  return template.replace('{n}', String(n)).replace('{total}', String(total));
}

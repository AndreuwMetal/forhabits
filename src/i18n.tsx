import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Periodicity } from './types';

export type Lang = 'es' | 'en';

const LANG_KEY = 'forhabits.lang.v1';

export const LANGUAGES: { code: Lang; label: string; short: string }[] = [
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'en', label: 'English', short: 'EN' },
];

const es = {
  tabRecords: 'Registros',
  tabApply: 'Aplicar',
  introHint: 'desliza para empezar',
  newHabit: 'Desarrollar un nuevo hábito',
  habitLabel: 'Hábito',
  habitPlaceholder: 'Ej: Correr 10 minutos',
  emojiLabel: 'Emoticono',
  emojiPlaceholder: 'Escribe cualquier emoji con tu teclado…',
  timeLabel: 'Hora (opcional)',
  timePlaceholder: '07:30',
  placeLabel: 'Lugar (opcional)',
  placePlaceholder: 'Ej: el parque, la cocina…',
  notesLabel: 'Anotaciones',
  notesPlaceholder: 'Escribe lo que quieras: motivos, recordatorios, ideas…',
  periodicity: 'Periodicidad',
  everyDay: 'Todos los días',
  specificDays: 'Días concretos',
  noDaysAssigned: 'Sin días asignados',
  cancel: 'Cancelar',
  saveHabit: 'Guardar hábito',
  save: 'Guardar',
  close: 'Cerrar',
  today: 'Hoy',
  habits: 'Hábitos',
  habitsEmpty:
    'Aún no tienes hábitos registrados. Crea el primero con “Desarrollar un nuevo hábito”.',
  stipulatedPeriodicity: 'Periodicidad estipulada',
  deleteHabit: 'Eliminar hábito',
  deleteConfirm: '¿Eliminar “{name}”?',
  delete: 'Eliminar',
  noHabitsThisDay: 'No hay hábitos programados para este día.',
  futureDay: 'Día futuro: aún no se puede registrar.',
  swipeChangeDay: '← desliza para cambiar de día →',
  completed: 'Completado',
  notCompleted: 'No completado',
  heroFirstHabit: 'crea tu primer hábito',
  heroDayComplete: '¡día completado! 🎉',
  heroTodayHabits: 'hábitos de hoy',
  applyHeading: '¿Qué hábito quieres trabajar?',
  applySubtitle: 'Te asesoro con las 4 leyes de Hábitos Atómicos de James Clear.',
  buildMode: 'Adquirir hábito',
  breakMode: 'Eliminar hábito',
  searchPlaceholder: 'Ej: correr, leer, meditar…',
  advise: 'Asesorar',
  toBuild: 'Para adquirir',
  toBreak: 'Para eliminar',
  registeredHabits: 'Tus hábitos registrados',
  notifBody: '¿Qué hábitos has completado hoy? Toca para registrarlos.',
  language: 'Idioma',
  editHabit: 'Editar hábito',
  saveChanges: 'Guardar cambios',
  notifTimeTitle: 'Notificación diaria',
  notifTimeLabel: 'Hora a la que se envía el DailyLog',
  notifTimeHint: 'Formato 24 h, ej. 21:00',
  unlogged: 'Sin registrar',
  historyTitle: 'DailyLog',
  historyEmpty: 'Aún no hay días con hábitos programados.',
};

export type StringKey = keyof typeof es;

const en: Record<StringKey, string> = {
  tabRecords: 'Records',
  tabApply: 'Apply',
  introHint: 'swipe to begin',
  newHabit: 'Develop a new habit',
  habitLabel: 'Habit',
  habitPlaceholder: 'E.g.: Run for 10 minutes',
  emojiLabel: 'Emoji',
  emojiPlaceholder: 'Type any emoji with your keyboard…',
  timeLabel: 'Time (optional)',
  timePlaceholder: '07:30',
  placeLabel: 'Place (optional)',
  placePlaceholder: 'E.g.: the park, the kitchen…',
  notesLabel: 'Notes',
  notesPlaceholder: 'Write anything: reasons, reminders, ideas…',
  periodicity: 'Frequency',
  everyDay: 'Every day',
  specificDays: 'Specific days',
  noDaysAssigned: 'No days assigned',
  cancel: 'Cancel',
  saveHabit: 'Save habit',
  save: 'Save',
  close: 'Close',
  today: 'Today',
  habits: 'Habits',
  habitsEmpty:
    'You have no habits yet. Create your first one with “Develop a new habit”.',
  stipulatedPeriodicity: 'Set frequency',
  deleteHabit: 'Delete habit',
  deleteConfirm: 'Delete “{name}”?',
  delete: 'Delete',
  noHabitsThisDay: 'No habits scheduled for this day.',
  futureDay: 'Future day: logging is not available yet.',
  swipeChangeDay: '← swipe to change day →',
  completed: 'Completed',
  notCompleted: 'Not completed',
  heroFirstHabit: 'create your first habit',
  heroDayComplete: 'day complete! 🎉',
  heroTodayHabits: "today's habits",
  applyHeading: 'Which habit do you want to work on?',
  applySubtitle: "I'll coach you with the 4 laws of James Clear's Atomic Habits.",
  buildMode: 'Build a habit',
  breakMode: 'Break a habit',
  searchPlaceholder: 'E.g.: run, read, meditate…',
  advise: 'Advise me',
  toBuild: 'To build',
  toBreak: 'To break',
  registeredHabits: 'Your registered habits',
  notifBody: 'Which habits did you complete today? Tap to log them.',
  language: 'Language',
  editHabit: 'Edit habit',
  saveChanges: 'Save changes',
  notifTimeTitle: 'Daily notification',
  notifTimeLabel: 'Time the DailyLog is sent',
  notifTimeHint: '24 h format, e.g. 21:00',
  unlogged: 'Not logged',
  historyTitle: 'DailyLog',
  historyEmpty: 'No days with scheduled habits yet.',
};

const STRINGS: Record<Lang, Record<StringKey, string>> = { es, en };

// ── calendario ──────────────────────────────────────────────────────────────

export const MONTHS: Record<Lang, string[]> = {
  es: [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ],
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
};

export const MONTHS_SHORT: Record<Lang, string[]> = {
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

/** Letras de los días con lunes primero */
export const WEEKDAY_LETTERS: Record<Lang, string[]> = {
  es: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
  en: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
};

/** Abreviaturas indexadas por getDay() (0 = domingo) */
export const WEEKDAYS_SHORT: Record<Lang, string[]> = {
  es: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

/** Nombres completos indexados por getDay() (0 = domingo) */
export const WEEKDAYS_FULL: Record<Lang, string[]> = {
  es: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};

/** "Lunes, 13 jul 2026" / "Monday, Jul 13 2026" */
export function formatDayTitle(d: Date, lang: Lang): string {
  const wd = WEEKDAYS_FULL[lang][d.getDay()];
  const m = MONTHS_SHORT[lang][d.getMonth()];
  if (lang === 'en') return `${wd}, ${m} ${d.getDate()} ${d.getFullYear()}`;
  return `${wd}, ${d.getDate()} ${m} ${d.getFullYear()}`;
}

export function periodicityLabel(p: Periodicity, lang: Lang): string {
  if (p.type === 'daily' || p.days.length === 7) return STRINGS[lang].everyDay;
  if (p.days.length === 0) return STRINGS[lang].noDaysAssigned;
  const sorted = [...p.days].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)); // lunes primero
  return sorted.map((d) => WEEKDAYS_SHORT[lang][d]).join(', ');
}

/** Acceso a cadenas fuera de componentes React (p. ej. notificaciones) */
export function getString(lang: Lang, key: StringKey): string {
  return STRINGS[lang][key];
}

// ── contexto ────────────────────────────────────────────────────────────────

interface I18n {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: StringKey) => string;
}

const I18nContext = createContext<I18n | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('es');

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY)
      .then((v) => {
        if (v === 'es' || v === 'en') setLangState(v);
      })
      .catch(() => {});
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    AsyncStorage.setItem(LANG_KEY, l).catch(() => {});
  }, []);

  const t = useCallback((key: StringKey) => STRINGS[lang][key], [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n debe usarse dentro de LanguageProvider');
  return ctx;
}

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Habit, addDays, formatDateEs, isDueOn, toKey } from './types';
import { isLastSundayOfMonth } from './analysis';
import { Lang, getString } from './i18n';

const DEFAULT_TIME = '21:00';
const CATEGORY = 'dailylog-habit';
const MAX_SCHEDULED = 55; // iOS admite ~64; se reserva hueco para los análisis

function parseTime(time: string): { hour: number; minute: number } {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(time.trim());
  if (!m) return { hour: 21, minute: 0 };
  return { hour: Number(m[1]), minute: Number(m[2]) };
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

/**
 * Programa el DailyLog de los próximos días: una notificación por hábito
 * debido, con botones "Completado" / "No completado" para registrar
 * directamente desde la notificación, sin abrir la app.
 */
export async function scheduleDailyLogs(
  habits: Habit[],
  lang: Lang = 'es',
  time: string = DEFAULT_TIME
): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (habits.length === 0) return;
    const granted = await requestNotificationPermission();
    if (!granted) return;

    // botones de acción (se registran en el idioma actual)
    await Notifications.setNotificationCategoryAsync(CATEGORY, [
      {
        identifier: 'completed',
        buttonTitle: `✅ ${getString(lang, 'completed')}`,
        options: { opensAppToForeground: false },
      },
      {
        identifier: 'not_completed',
        buttonTitle: `❌ ${getString(lang, 'notCompleted')}`,
        options: { opensAppToForeground: false },
      },
    ]);

    const { hour, minute } = parseTime(time);
    const days = Math.max(1, Math.min(7, Math.floor(MAX_SCHEDULED / habits.length)));
    const now = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, hour, minute, 0);
      if (date <= now) continue;
      const dateKey = toKey(date);
      for (const habit of habits) {
        if (!isDueOn(habit, date)) continue;
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `DailyLog | ${formatDateEs(date)}`,
            body: `${habit.emoji} ${habit.name} — ${getString(lang, 'notifBodyHabit')}`,
            data: { dateKey, habitId: habit.id },
            categoryIdentifier: CATEGORY,
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
        });
      }
    }

    // Análisis semanal: próximos 2 domingos a las 21:30.
    // Análisis mensual: si el domingo es el último del mes, a las 21:45.
    let sundaysScheduled = 0;
    let d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    for (let i = 0; i < 15 && sundaysScheduled < 2; i++) {
      if (d.getDay() === 0) {
        const weekly = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 21, 30);
        if (weekly > now) {
          sundaysScheduled++;
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `📊 ${getString(lang, 'weeklyAnalysis')} | ${formatDateEs(weekly)}`,
              body: getString(lang, 'weeklyNotifBody'),
              data: { type: 'weekly', dateKey: toKey(weekly) },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: weekly,
            },
          });
          if (isLastSundayOfMonth(d)) {
            const monthly = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 21, 45);
            await Notifications.scheduleNotificationAsync({
              content: {
                title: `📈 ${getString(lang, 'monthlyAnalysis')} | ${formatDateEs(monthly)}`,
                body: getString(lang, 'monthlyNotifBody'),
                data: { type: 'monthly', dateKey: toKey(monthly) },
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: monthly,
              },
            });
          }
        }
      }
      d = addDays(d, 1);
    }
  } catch (e) {
    console.warn('No se pudieron programar las notificaciones', e);
  }
}

export type DailyLogResponse =
  | { type: 'open'; dateKey: string }
  | { type: 'action'; dateKey: string; habitId: string; done: boolean }
  | { type: 'analysis'; mode: 'weekly' | 'monthly'; dateKey: string };

function parseResponse(
  response: Notifications.NotificationResponse
): DailyLogResponse | null {
  const data = response.notification.request.content.data as
    | { dateKey?: unknown; habitId?: unknown; type?: unknown }
    | undefined;
  const dateKey = data?.dateKey;
  if (typeof dateKey !== 'string') return null;
  if (data?.type === 'weekly' || data?.type === 'monthly') {
    return { type: 'analysis', mode: data.type, dateKey };
  }
  const action = response.actionIdentifier;
  if (action === 'completed' || action === 'not_completed') {
    const habitId = data?.habitId;
    if (typeof habitId !== 'string') return null;
    return { type: 'action', dateKey, habitId, done: action === 'completed' };
  }
  return { type: 'open', dateKey };
}

/**
 * Escucha las respuestas a las notificaciones DailyLog:
 * - botón Completado / No completado → registro directo (sin abrir la app)
 * - toque en el cuerpo → abrir el formulario del día
 * También recupera la última respuesta si la app estaba cerrada.
 */
export function onDailyLogResponse(cb: (r: DailyLogResponse) => void) {
  if (Platform.OS === 'web') return { remove: () => {} };
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    const parsed = parseResponse(response);
    if (parsed) cb(parsed);
  });
  Notifications.getLastNotificationResponseAsync()
    .then((response) => {
      if (response) {
        const parsed = parseResponse(response);
        if (parsed) cb(parsed);
      }
    })
    .catch(() => {});
  return sub;
}

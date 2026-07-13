import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { formatDateEs, toKey } from './types';

const DAILYLOG_HOUR = 21;

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
 * Programa el DailyLog de los próximos 7 días con la fecha exacta en el
 * título ("DailyLog | dd/mm/aaaa"). Se reprograma en cada apertura de la app.
 */
export async function scheduleDailyLogs(habitCount: number): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (habitCount === 0) return;
    const granted = await requestNotificationPermission();
    if (!granted) return;

    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, DAILYLOG_HOUR, 0, 0);
      if (date <= now) continue;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `DailyLog | ${formatDateEs(date)}`,
          body: '¿Qué hábitos has completado hoy? Toca para registrarlos.',
          data: { dateKey: toKey(date) },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
      });
    }
  } catch (e) {
    console.warn('No se pudieron programar las notificaciones', e);
  }
}

/** Devuelve una suscripción; el callback recibe la fecha del DailyLog tocado. */
export function onDailyLogTap(cb: (dateKey: string) => void) {
  if (Platform.OS === 'web') return { remove: () => {} };
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const dateKey = response.notification.request.content.data?.dateKey;
    if (typeof dateKey === 'string') cb(dateKey);
  });
}

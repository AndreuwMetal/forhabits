import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import IntroScreen from './src/screens/IntroScreen';
import MainScreen from './src/screens/MainScreen';
import DailyLogSheet from './src/components/DailyLogSheet';
import { StoreProvider, useStore } from './src/store';
import { LanguageProvider, useI18n } from './src/i18n';
import { onDailyLogResponse, scheduleDailyLogs } from './src/notifications';
import { theme } from './src/theme';

function Root() {
  const { ready, habits, notifTime, saveDayLog } = useStore();
  const { lang } = useI18n();
  const [showIntro, setShowIntro] = useState(true);
  const [notificationDate, setNotificationDate] = useState<string | null>(null);

  // Reprograma los DailyLog al abrir la app o cambiar hábitos, hora o idioma
  useEffect(() => {
    if (ready) scheduleDailyLogs(habits, lang, notifTime);
  }, [ready, habits, lang, notifTime]);

  // Respuestas a la notificación DailyLog:
  // botones → registro directo; toque → abrir el formulario del día
  useEffect(() => {
    const sub = onDailyLogResponse((r) => {
      if (r.type === 'action') {
        saveDayLog(r.dateKey, { [r.habitId]: r.done });
      } else {
        setShowIntro(false);
        setNotificationDate(r.dateKey);
      }
    });
    return () => sub.remove();
  }, [saveDayLog]);

  if (!ready) return null;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      {showIntro ? (
        <IntroScreen onDone={() => setShowIntro(false)} />
      ) : (
        <MainScreen />
      )}
      {notificationDate && !showIntro && (
        <DailyLogSheet
          dateKey={notificationDate}
          onClose={() => setNotificationDate(null)}
        />
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <StoreProvider>
        <Root />
      </StoreProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
});

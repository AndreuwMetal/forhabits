import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import IntroScreen from './src/screens/IntroScreen';
import MainScreen from './src/screens/MainScreen';
import DailyLogSheet from './src/components/DailyLogSheet';
import { StoreProvider, useStore } from './src/store';
import { LanguageProvider, useI18n } from './src/i18n';
import { onDailyLogTap, scheduleDailyLogs } from './src/notifications';
import { theme } from './src/theme';

function Root() {
  const { ready, habits, notifTime } = useStore();
  const { lang } = useI18n();
  const [showIntro, setShowIntro] = useState(true);
  const [notificationDate, setNotificationDate] = useState<string | null>(null);

  // Reprograma los DailyLog de la próxima semana en cada apertura
  useEffect(() => {
    if (ready) scheduleDailyLogs(habits.length, lang, notifTime);
  }, [ready, habits.length, lang, notifTime]);

  // Al tocar la notificación DailyLog se abre el formulario del día
  useEffect(() => {
    const sub = onDailyLogTap((dateKey) => {
      setShowIntro(false);
      setNotificationDate(dateKey);
    });
    return () => sub.remove();
  }, []);

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

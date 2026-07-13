import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import IntroScreen from './src/screens/IntroScreen';
import MainScreen from './src/screens/MainScreen';
import DailyLogSheet from './src/components/DailyLogSheet';
import { StoreProvider, useStore } from './src/store';
import { onDailyLogTap, scheduleDailyLogs } from './src/notifications';
import { theme } from './src/theme';

function Root() {
  const { ready, habits } = useStore();
  const [showIntro, setShowIntro] = useState(true);
  const [notificationDate, setNotificationDate] = useState<string | null>(null);

  // Reprograma los DailyLog de la próxima semana en cada apertura
  useEffect(() => {
    if (ready) scheduleDailyLogs(habits.length);
  }, [ready, habits.length]);

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
      <StatusBar style={showIntro ? 'light' : 'dark'} />
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
    <StoreProvider>
      <Root />
    </StoreProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
});

import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MonthCalendar, { MonthCalendarRef } from '../components/MonthCalendar';
import HabitForm from '../components/HabitForm';
import HabitsLegendModal from '../components/HabitsLegendModal';
import DailyLogSheet from '../components/DailyLogSheet';
import { useStore } from '../store';
import { scheduleDailyLogs } from '../notifications';
import { theme } from '../theme';
import { fromKey, toKey } from '../types';

export default function RecordsScreen() {
  const { habits, logs, addHabit, removeHabit } = useStore();
  const calRef = useRef<MonthCalendarRef>(null);
  const [legendVisible, setLegendVisible] = useState(false);
  const [dailyLogDate, setDailyLogDate] = useState<string | null>(null);
  const [highlightToday, setHighlightToday] = useState(false);
  const lastTodayPress = useRef(0);

  const onToday = () => {
    const now = Date.now();
    if (now - lastTodayPress.current < 2500) {
      // segundo click: resalta el día de hoy
      setHighlightToday(true);
      setTimeout(() => setHighlightToday(false), 1800);
    } else {
      calRef.current?.scrollToCurrentMonth();
    }
    lastTodayPress.current = now;
  };

  const onDayPress = (dateKey: string) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (fromKey(dateKey) > today) return; // no se registran días futuros
    setDailyLogDate(dateKey);
  };

  return (
    <View style={styles.root}>
      <MonthCalendar
        ref={calRef}
        habits={habits}
        logs={logs}
        highlightToday={highlightToday}
        onDayPress={onDayPress}
        ListHeaderComponent={
          <HabitForm
            onSave={(data) => {
              addHabit(data);
              scheduleDailyLogs(habits.length + 1);
            }}
          />
        }
      />

      <View style={styles.toolbar}>
        <Pressable style={styles.toolBtn} onPress={onToday}>
          <Text style={styles.toolText}>Today</Text>
        </Pressable>
        <Pressable style={styles.toolBtn} onPress={() => setLegendVisible(true)}>
          <Text style={styles.toolText}>Habits</Text>
        </Pressable>
      </View>

      <HabitsLegendModal
        visible={legendVisible}
        habits={habits}
        onClose={() => setLegendVisible(false)}
        onDelete={(id) => {
          removeHabit(id);
          scheduleDailyLogs(habits.length - 1);
        }}
      />
      <DailyLogSheet dateKey={dailyLogDate} onClose={() => setDailyLogDate(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  toolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  toolBtn: { padding: 6 },
  toolText: { color: theme.colors.today, fontSize: 17, fontWeight: '600' },
});

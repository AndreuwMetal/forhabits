import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MonthCalendar, { MonthCalendarRef } from '../components/MonthCalendar';
import HabitForm from '../components/HabitForm';
import HabitsLegendModal from '../components/HabitsLegendModal';
import MonthView from './MonthView';
import DayView from './DayView';
import { useStore } from '../store';
import { scheduleDailyLogs } from '../notifications';
import { theme } from '../theme';
import { fromKey, startOfMonth, toKey } from '../types';

type ViewState =
  | { kind: 'list' }
  | { kind: 'month'; month: Date }
  | { kind: 'day'; dateKey: string };

export default function RecordsScreen() {
  const { habits, logs, firstUse, addHabit, removeHabit, saveDayLog } = useStore();
  const calRef = useRef<MonthCalendarRef>(null);
  const [legendVisible, setLegendVisible] = useState(false);
  const [view, setView] = useState<ViewState>({ kind: 'list' });

  const firstUseDate = new Date(firstUse);
  const minDateKey = toKey(firstUseDate);

  // Today: lista → mes actual ampliado → día de hoy (y desde día, salta a hoy)
  const onToday = () => {
    if (view.kind === 'list') {
      setView({ kind: 'month', month: startOfMonth(new Date()) });
    } else if (view.kind === 'month') {
      setView({ kind: 'day', dateKey: toKey(new Date()) });
    } else {
      setView({ kind: 'day', dateKey: toKey(new Date()) });
    }
  };

  return (
    <View style={styles.root}>
      {view.kind === 'list' && (
        <MonthCalendar
          ref={calRef}
          habits={habits}
          logs={logs}
          firstUse={firstUseDate}
          onDayPress={(dateKey) => setView({ kind: 'day', dateKey })}
          onMonthTitlePress={(month) => setView({ kind: 'month', month })}
          ListHeaderComponent={
            <HabitForm
              onSave={(data) => {
                addHabit(data);
                scheduleDailyLogs(habits.length + 1);
              }}
            />
          }
        />
      )}

      {view.kind === 'month' && (
        <MonthView
          month={view.month}
          minMonth={startOfMonth(firstUseDate)}
          habits={habits}
          logs={logs}
          onMonthChange={(m) => setView({ kind: 'month', month: m })}
          onBack={() => setView({ kind: 'list' })}
          onDayPress={(dateKey) => setView({ kind: 'day', dateKey })}
        />
      )}

      {view.kind === 'day' && (
        <DayView
          dateKey={view.dateKey}
          minDateKey={minDateKey}
          habits={habits}
          logs={logs}
          onDateChange={(dateKey) => setView({ kind: 'day', dateKey })}
          onBack={() =>
            setView({ kind: 'month', month: startOfMonth(fromKey(view.dateKey)) })
          }
          saveDayLog={saveDayLog}
        />
      )}

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
    backgroundColor: 'rgba(0,0,0,0.92)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  toolBtn: { padding: 6 },
  toolText: { color: theme.colors.today, fontSize: 17, fontWeight: '600' },
});

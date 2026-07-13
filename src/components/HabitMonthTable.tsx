import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Habit,
  Logs,
  MONTHS_ES,
  addMonths,
  isDueOn,
  monthDiff,
  startOfMonth,
  toKey,
} from '../types';
import { theme } from '../theme';

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

interface Props {
  habit: Habit;
  logs: Logs;
  /** primer mes navegable (primer uso de la app) */
  minMonth: Date;
}

/**
 * Tabla del mes para un hábito: cada día del mes con un tick ✓ en los
 * días en que el hábito se registró como completado.
 */
export default function HabitMonthTable({ habit, logs, minMonth }: Props) {
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const todayKey = toKey(new Date());

  const canPrev = monthDiff(startOfMonth(minMonth), month) > 0;
  const canNext = monthDiff(month, startOfMonth(new Date())) > 0;

  const first = startOfMonth(month);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7; // lunes primero
  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: (number | null)[][] = [];
  for (let r = 0; r < cells.length / 7; r++) rows.push(cells.slice(r * 7, r * 7 + 7));

  return (
    <View style={styles.table}>
      <View style={styles.navRow}>
        <Pressable
          style={[styles.navBtn, !canPrev && styles.navDisabled]}
          onPress={() => canPrev && setMonth(addMonths(month, -1))}
        >
          <Text style={styles.navText}>‹</Text>
        </Pressable>
        <Text style={styles.monthTitle}>
          {MONTHS_ES[month.getMonth()]} {month.getFullYear()}
        </Text>
        <Pressable
          style={[styles.navBtn, !canNext && styles.navDisabled]}
          onPress={() => canNext && setMonth(addMonths(month, 1))}
        >
          <Text style={styles.navText}>›</Text>
        </Pressable>
      </View>
      <View style={styles.weekRow}>
        {WEEKDAYS.map((w, i) => (
          <Text key={i} style={styles.weekday}>
            {w}
          </Text>
        ))}
      </View>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.weekRow}>
          {row.map((day, ci) => {
            if (day === null) return <View key={ci} style={styles.cell} />;
            const date = new Date(month.getFullYear(), month.getMonth(), day);
            const dateKey = toKey(date);
            const completed = logs[dateKey]?.[habit.id] === true;
            const due = isDueOn(habit, date);
            const isToday = dateKey === todayKey;
            return (
              <View key={ci} style={styles.cell}>
                <Text
                  style={[
                    styles.dayNum,
                    !due && styles.dayOff,
                    isToday && styles.today,
                  ]}
                >
                  {day}
                </Text>
                <Text style={[styles.tick, !completed && styles.tickHidden]}>✓</Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    marginTop: 10,
    marginLeft: 34,
    marginRight: 4,
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 10,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  navBtn: { paddingHorizontal: 12, paddingVertical: 2 },
  navDisabled: { opacity: 0.25 },
  navText: { color: theme.colors.cyan, fontSize: 22, fontWeight: '700' },
  monthTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  weekRow: { flexDirection: 'row' },
  weekday: {
    flex: 1,
    textAlign: 'center',
    color: theme.colors.subtext,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  cell: { flex: 1, alignItems: 'center', paddingVertical: 3, minHeight: 34 },
  dayNum: { color: theme.colors.text, fontSize: 13 },
  dayOff: { color: theme.colors.subtext, opacity: 0.45 },
  today: { color: theme.colors.today, fontWeight: '800' },
  tick: { color: theme.colors.success, fontSize: 12, fontWeight: '900', lineHeight: 14 },
  tickHidden: { opacity: 0 },
});

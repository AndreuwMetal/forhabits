import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Habit, Logs, toKey } from '../types';
import { theme } from '../theme';

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const PAST_MONTHS = 12;
const FUTURE_MONTHS = 2;
const ROW_HEIGHT = 58;
const TITLE_HEIGHT = 44;
const MONTH_MARGIN = 10;
const MONTH_HEIGHT = TITLE_HEIGHT + 6 * ROW_HEIGHT + MONTH_MARGIN;

interface MonthData {
  year: number;
  month: number; // 0-11
}

interface Props {
  habits: Habit[];
  logs: Logs;
  highlightToday: boolean;
  onDayPress: (dateKey: string) => void;
  ListHeaderComponent?: React.ReactElement;
}

export interface MonthCalendarRef {
  scrollToCurrentMonth: () => void;
}

function buildMonths(): MonthData[] {
  const now = new Date();
  const list: MonthData[] = [];
  for (let i = -PAST_MONTHS; i <= FUTURE_MONTHS; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    list.push({ year: d.getFullYear(), month: d.getMonth() });
  }
  return list;
}

const MonthCalendar = forwardRef<MonthCalendarRef, Props>(function MonthCalendar(
  { habits, logs, highlightToday, onDayPress, ListHeaderComponent },
  ref
) {
  const listRef = useRef<FlatList<MonthData>>(null);
  const months = useMemo(buildMonths, []);
  const todayKey = toKey(new Date());
  const emojiById = useMemo(
    () => Object.fromEntries(habits.map((h) => [h.id, h.emoji])),
    [habits]
  );

  useImperativeHandle(ref, () => ({
    scrollToCurrentMonth: () => {
      listRef.current?.scrollToIndex({ index: PAST_MONTHS, animated: true });
    },
  }));

  const renderMonth = useCallback(
    ({ item }: { item: MonthData }) => {
      const first = new Date(item.year, item.month, 1);
      const daysInMonth = new Date(item.year, item.month + 1, 0).getDate();
      // Lunes como primer día de la semana
      const offset = (first.getDay() + 6) % 7;
      const cells: (number | null)[] = [
        ...Array(offset).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
      ];
      while (cells.length < 42) cells.push(null);

      const rows: (number | null)[][] = [];
      for (let r = 0; r < 6; r++) rows.push(cells.slice(r * 7, r * 7 + 7));

      return (
        <View style={styles.month}>
          <Text style={styles.monthTitle}>
            {MONTHS_ES[item.month]} {item.year}
          </Text>
          {rows.map((row, ri) => (
            <View key={ri} style={styles.week}>
              {row.map((day, ci) => {
                if (day === null) return <View key={ci} style={styles.cell} />;
                const dateKey = toKey(new Date(item.year, item.month, day));
                const isToday = dateKey === todayKey;
                const dayLog = logs[dateKey];
                const emojis = dayLog
                  ? Object.entries(dayLog)
                      .filter(([id, done]) => done && emojiById[id])
                      .map(([id]) => emojiById[id])
                  : [];
                return (
                  <Pressable
                    key={ci}
                    style={styles.cell}
                    onPress={() => onDayPress(dateKey)}
                  >
                    <View
                      style={[
                        styles.dayNumWrap,
                        isToday && styles.todayCircle,
                        isToday && highlightToday && styles.todayPulse,
                      ]}
                    >
                      <Text style={[styles.dayNum, isToday && styles.todayNum]}>
                        {day}
                      </Text>
                    </View>
                    <Text style={styles.emojis} numberOfLines={2}>
                      {emojis.slice(0, 4).join('')}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      );
    },
    [logs, emojiById, todayKey, highlightToday, onDayPress]
  );

  return (
    <View style={styles.root}>
      <FlatList
        ref={listRef}
        data={months}
        keyExtractor={(m) => `${m.year}-${m.month}`}
        renderItem={renderMonth}
        initialScrollIndex={PAST_MONTHS}
        getItemLayout={(_data, index) => {
          // el encabezado desplaza el offset solo si existe
          return {
            length: MONTH_HEIGHT,
            offset: MONTH_HEIGHT * index,
            index,
          };
        }}
        ListHeaderComponent={ListHeaderComponent}
        stickyHeaderIndices={undefined}
        showsVerticalScrollIndicator={false}
        onScrollToIndexFailed={() => {}}
        contentContainerStyle={styles.content}
      />
      <View style={styles.weekdayBar}>
        {WEEKDAYS.map((w, i) => (
          <Text key={i} style={styles.weekday}>
            {w}
          </Text>
        ))}
      </View>
    </View>
  );
});

export default MonthCalendar;

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingBottom: 90 },
  weekdayBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    paddingVertical: 4,
    display: 'none', // se muestra solo si se quiere cabecera fija global
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: theme.colors.subtext,
    fontWeight: '600',
  },
  month: { marginBottom: MONTH_MARGIN, height: MONTH_HEIGHT - MONTH_MARGIN },
  monthTitle: {
    height: TITLE_HEIGHT,
    lineHeight: TITLE_HEIGHT,
    paddingHorizontal: 16,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  week: { flexDirection: 'row', height: ROW_HEIGHT },
  cell: { flex: 1, alignItems: 'center', paddingTop: 4 },
  dayNumWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCircle: { backgroundColor: theme.colors.today },
  todayPulse: {
    shadowColor: theme.colors.today,
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ scale: 1.15 }],
  },
  dayNum: { fontSize: 15, color: theme.colors.text },
  todayNum: { color: '#fff', fontWeight: '700' },
  emojis: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 12,
    maxWidth: '95%',
  },
});

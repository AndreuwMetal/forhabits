import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Emoji from './Emoji';
import {
  Habit,
  Logs,
  MONTHS_ES,
  addMonths,
  monthDiff,
  startOfMonth,
  toKey,
} from '../types';
import { theme } from '../theme';

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const FUTURE_MONTHS = 3;
const ROW_HEIGHT = 58;
const TITLE_HEIGHT = 44;
const WEEKDAY_ROW_HEIGHT = 20;
const MONTH_MARGIN = 10;
const MONTH_HEIGHT = TITLE_HEIGHT + WEEKDAY_ROW_HEIGHT + 6 * ROW_HEIGHT + MONTH_MARGIN;

interface MonthData {
  year: number;
  month: number; // 0-11
}

interface Props {
  habits: Habit[];
  logs: Logs;
  firstUse: Date; // el calendario empieza en el mes de primer uso
  onDayPress: (dateKey: string) => void;
  onMonthTitlePress?: (month: Date) => void;
  ListHeaderComponent?: React.ReactElement;
}

export interface MonthCalendarRef {
  scrollToCurrentMonth: () => void;
}

const MonthCalendar = forwardRef<MonthCalendarRef, Props>(function MonthCalendar(
  { habits, logs, firstUse, onDayPress, onMonthTitlePress, ListHeaderComponent },
  ref
) {
  const listRef = useRef<FlatList<MonthData>>(null);
  const todayKey = toKey(new Date());

  const { months, currentIndex } = useMemo(() => {
    const start = startOfMonth(firstUse);
    const count = monthDiff(start, startOfMonth(new Date())) + FUTURE_MONTHS + 1;
    const list: MonthData[] = [];
    for (let i = 0; i < count; i++) {
      const d = addMonths(start, i);
      list.push({ year: d.getFullYear(), month: d.getMonth() });
    }
    return { months: list, currentIndex: Math.max(0, count - FUTURE_MONTHS - 1) };
  }, [firstUse]);

  const emojiById = useMemo(
    () => Object.fromEntries(habits.map((h) => [h.id, h.emoji])),
    [habits]
  );

  useImperativeHandle(ref, () => ({
    scrollToCurrentMonth: () => {
      listRef.current?.scrollToIndex({ index: currentIndex, animated: true });
    },
  }));

  const renderMonth = useCallback(
    ({ item }: { item: MonthData }) => {
      const first = new Date(item.year, item.month, 1);
      const daysInMonth = new Date(item.year, item.month + 1, 0).getDate();
      const offset = (first.getDay() + 6) % 7; // lunes primero
      const cells: (number | null)[] = [
        ...Array(offset).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
      ];
      while (cells.length < 42) cells.push(null);
      const rows: (number | null)[][] = [];
      for (let r = 0; r < 6; r++) rows.push(cells.slice(r * 7, r * 7 + 7));

      return (
        <View style={styles.month}>
          <Pressable
            onPress={() =>
              onMonthTitlePress?.(new Date(item.year, item.month, 1))
            }
          >
            <Text style={styles.monthTitle}>
              {MONTHS_ES[item.month]}{' '}
              <Text style={styles.yearText}>{item.year}</Text>
            </Text>
          </Pressable>
          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((w, i) => (
              <Text key={i} style={styles.weekday}>
                {w}
              </Text>
            ))}
          </View>
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
                    <View style={[styles.dayNumWrap, isToday && styles.todayCircle]}>
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
    [logs, emojiById, todayKey, onDayPress, onMonthTitlePress]
  );

  return (
    <FlatList
      ref={listRef}
      data={months}
      keyExtractor={(m) => `${m.year}-${m.month}`}
      renderItem={renderMonth}
      initialScrollIndex={currentIndex}
      getItemLayout={(_data, index) => ({
        length: MONTH_HEIGHT,
        offset: MONTH_HEIGHT * index,
        index,
      })}
      ListHeaderComponent={ListHeaderComponent}
      showsVerticalScrollIndicator={false}
      onScrollToIndexFailed={() => {}}
      contentContainerStyle={styles.content}
    />
  );
});

export default MonthCalendar;

const styles = StyleSheet.create({
  content: { paddingBottom: 90 },
  month: { marginBottom: MONTH_MARGIN, height: MONTH_HEIGHT - MONTH_MARGIN },
  monthTitle: {
    height: TITLE_HEIGHT,
    lineHeight: TITLE_HEIGHT,
    paddingHorizontal: 16,
    fontSize: 21,
    fontWeight: '700',
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  yearText: { color: theme.colors.subtext, fontWeight: '500' },
  weekdayRow: {
    flexDirection: 'row',
    height: WEEKDAY_ROW_HEIGHT,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.subtext,
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

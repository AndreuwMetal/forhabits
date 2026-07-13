import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Emoji from '../components/Emoji';
import {
  Habit,
  Logs,
  addMonths,
  isDueOn,
  monthDiff,
  startOfMonth,
  toKey,
} from '../types';
import { MONTHS, WEEKDAY_LETTERS, useI18n } from '../i18n';
import { theme } from '../theme';
const { width: SCREEN_W } = Dimensions.get('window');
const SWIPE_THRESHOLD = 60;

interface Props {
  month: Date; // primer día del mes mostrado
  minMonth: Date; // no se puede retroceder antes de este mes
  habits: Habit[];
  logs: Logs;
  onMonthChange: (m: Date) => void;
  onBack: () => void;
  onDayPress: (dateKey: string) => void;
}

export default function MonthView({
  month,
  minMonth,
  habits,
  logs,
  onMonthChange,
  onBack,
  onDayPress,
}: Props) {
  const { lang, t } = useI18n();
  const translateX = useRef(new Animated.Value(0)).current;
  const [animating, setAnimating] = useState(false);
  const todayKey = toKey(new Date());
  const maxMonth = addMonths(startOfMonth(new Date()), 12);

  const canPrev = monthDiff(startOfMonth(minMonth), month) > 0;
  const canNext = monthDiff(month, maxMonth) > 0;

  const slideTo = (dir: 1 | -1) => {
    // dir 1 = mes siguiente (desliza a la izquierda)
    setAnimating(true);
    Animated.timing(translateX, {
      toValue: -dir * SCREEN_W,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      onMonthChange(addMonths(month, dir));
      translateX.setValue(dir * SCREEN_W);
      Animated.timing(translateX, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(() => setAnimating(false));
    });
  };

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) =>
        Math.abs(g.dx) > 16 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderMove: (_e, g) => translateX.setValue(g.dx * 0.6),
      onPanResponderRelease: (_e, g) => {
        if (g.dx < -SWIPE_THRESHOLD && canNextRef.current) slideTo(1);
        else if (g.dx > SWIPE_THRESHOLD && canPrevRef.current) slideTo(-1);
        else
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
      },
    })
  ).current;

  // refs para que el PanResponder (creado una sola vez) lea el estado actual
  const canPrevRef = useRef(canPrev);
  const canNextRef = useRef(canNext);
  canPrevRef.current = canPrev;
  canNextRef.current = canNext;

  // Construye las celdas del mes (lunes primero)
  const first = startOfMonth(month);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7;
  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: (number | null)[][] = [];
  for (let r = 0; r < cells.length / 7; r++) rows.push(cells.slice(r * 7, r * 7 + 7));

  return (
    <View style={styles.root} {...pan.panHandlers}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack} disabled={animating}>
          <Text style={styles.backChevron}>‹</Text>
          <Text style={styles.backText}>{t('tabRecords')}</Text>
        </Pressable>
      </View>
      <Animated.View style={[styles.animPane, { transform: [{ translateX }] }]}>
        <Text style={styles.monthTitle}>
          {MONTHS[lang][month.getMonth()]}{' '}
          <Text style={styles.yearText}>{month.getFullYear()}</Text>
        </Text>
        <View style={styles.weekdayRow}>
          {WEEKDAY_LETTERS[lang].map((w, i) => (
            <Text key={i} style={[styles.weekday, i >= 5 && styles.weekendDay]}>
              {w}
            </Text>
          ))}
        </View>
        <View style={styles.grid}>
          {rows.map((row, ri) => (
            <View key={ri} style={styles.week}>
              {row.map((day, ci) => {
                if (day === null) return <View key={ci} style={styles.cell} />;
                const date = new Date(month.getFullYear(), month.getMonth(), day);
                const dateKey = toKey(date);
                const isToday = dateKey === todayKey;
                const dayLog = logs[dateKey] ?? {};
                const due = habits.filter((h) => isDueOn(h, date));
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
                    <View style={styles.cellEmojis}>
                      {due.slice(0, 6).map((h) => (
                        <Emoji key={h.id} size={13} dim={dayLog[h.id] !== true}>
                          {h.emoji}
                        </Emoji>
                      ))}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', padding: 4 },
  backChevron: { color: theme.colors.cyan, fontSize: 28, marginRight: 4, lineHeight: 30 },
  backText: { color: theme.colors.cyan, fontSize: 17, fontWeight: '700' },
  animPane: { flex: 1 },
  monthTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: theme.colors.text,
    paddingHorizontal: 16,
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  yearText: { color: theme.colors.subtext, fontWeight: '600' },
  weekdayRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    paddingBottom: 6,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },
  weekendDay: { color: theme.colors.subtext },
  grid: { flex: 1, paddingBottom: 60 },
  week: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  cell: { flex: 1, alignItems: 'center', paddingTop: 6 },
  dayNumWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCircle: {
    backgroundColor: theme.colors.today,
    shadowColor: theme.colors.today,
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  dayNum: { fontSize: 16, color: theme.colors.text },
  todayNum: { color: '#fff', fontWeight: '700' },
  cellEmojis: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 1,
    paddingHorizontal: 2,
    marginTop: 2,
  },
});

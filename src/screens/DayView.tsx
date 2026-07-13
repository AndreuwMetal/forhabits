import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Emoji from '../components/Emoji';
import {
  DayLog,
  Habit,
  Logs,
  MONTHS_ES,
  addDays,
  formatDayTitleEs,
  fromKey,
  isDueOn,
  toKey,
} from '../types';
import { theme } from '../theme';

const { width: SCREEN_W } = Dimensions.get('window');
const SWIPE_THRESHOLD = 60;

interface Props {
  dateKey: string;
  minDateKey: string; // primer día visible (primer uso de la app)
  habits: Habit[];
  logs: Logs;
  onDateChange: (dateKey: string) => void;
  onBack: () => void;
  saveDayLog: (dateKey: string, log: DayLog) => void;
}

export default function DayView({
  dateKey,
  minDateKey,
  habits,
  logs,
  onDateChange,
  onBack,
  saveDayLog,
}: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [animating, setAnimating] = useState(false);

  const date = fromKey(dateKey);
  const todayKey = toKey(new Date());
  const isFuture = dateKey > todayKey;
  const due = habits.filter((h) => isDueOn(h, date));
  const dayLog = logs[dateKey] ?? {};
  const maxDateKey = toKey(addDays(new Date(), 365));

  const canPrev = dateKey > minDateKey;
  const canNext = dateKey < maxDateKey;
  const canPrevRef = useRef(canPrev);
  const canNextRef = useRef(canNext);
  canPrevRef.current = canPrev;
  canNextRef.current = canNext;

  const slideTo = (dir: 1 | -1) => {
    setAnimating(true);
    Animated.timing(translateX, {
      toValue: -dir * SCREEN_W,
      duration: 160,
      useNativeDriver: true,
    }).start(() => {
      onDateChange(toKey(addDays(date, dir)));
      translateX.setValue(dir * SCREEN_W);
      Animated.timing(translateX, {
        toValue: 0,
        duration: 160,
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

  const setValue = (habitId: string, done: boolean) => {
    if (isFuture) return;
    saveDayLog(dateKey, { [habitId]: done });
  };

  return (
    <View style={styles.root} {...pan.panHandlers}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack} disabled={animating}>
          <Text style={styles.backChevron}>‹</Text>
          <Text style={styles.backText}>
            {MONTHS_ES[date.getMonth()].charAt(0).toUpperCase() +
              MONTHS_ES[date.getMonth()].slice(1)}
          </Text>
        </Pressable>
      </View>
      <Animated.View style={[styles.animPane, { transform: [{ translateX }] }]}>
        <Text style={[styles.dayTitle, dateKey === todayKey && styles.todayTitle]}>
          {formatDayTitleEs(date)}
        </Text>
        {isFuture && (
          <Text style={styles.futureHint}>
            Día futuro: aún no se puede registrar.
          </Text>
        )}
        {due.length === 0 ? (
          <Text style={styles.empty}>No hay hábitos programados para este día.</Text>
        ) : (
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {due.map((h) => {
              const value = dayLog[h.id];
              return (
                <View key={h.id} style={styles.row}>
                  <Emoji size={26} dim={value !== true}>
                    {h.emoji}
                  </Emoji>
                  <View style={styles.nameCol}>
                    <Text style={styles.name} numberOfLines={2}>
                      {h.name}
                    </Text>
                    {(h.time || h.place) && (
                      <Text style={styles.meta} numberOfLines={1}>
                        {h.time ? `🕐 ${h.time}` : ''}
                        {h.time && h.place ? '  ' : ''}
                        {h.place ? `📍 ${h.place}` : ''}
                      </Text>
                    )}
                  </View>
                  <View style={styles.segment}>
                    <Pressable
                      style={[
                        styles.segBtn,
                        value === true && styles.segDone,
                        isFuture && styles.segDisabled,
                      ]}
                      onPress={() => setValue(h.id, true)}
                    >
                      <Text style={[styles.segText, value === true && styles.segTextOn]}>
                        Completed
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.segBtn,
                        value === false && styles.segNot,
                        isFuture && styles.segDisabled,
                      ]}
                      onPress={() => setValue(h.id, false)}
                    >
                      <Text
                        style={[styles.segText, value === false && styles.segTextOn]}
                      >
                        Not completed
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
        <Text style={styles.swipeHint}>← desliza para cambiar de día →</Text>
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
  dayTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  todayTitle: { color: theme.colors.today },
  futureHint: {
    color: theme.colors.subtext,
    fontSize: 13,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  empty: { color: theme.colors.subtext, fontSize: 15, padding: 16 },
  list: { flex: 1 },
  listContent: { paddingBottom: 80 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    flexWrap: 'wrap',
  },
  nameCol: { flex: 1, gap: 2 },
  name: { fontSize: 16, color: theme.colors.text, fontWeight: '500' },
  meta: { fontSize: 12.5, color: theme.colors.subtext },
  segment: { flexDirection: 'row', gap: 6 },
  segBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
  },
  segDone: { backgroundColor: theme.colors.success },
  segNot: { backgroundColor: theme.colors.danger },
  segDisabled: { opacity: 0.35 },
  segText: { fontSize: 12.5, fontWeight: '600', color: theme.colors.text },
  segTextOn: { color: '#fff' },
  swipeHint: {
    position: 'absolute',
    bottom: 64,
    alignSelf: 'center',
    color: theme.colors.subtext,
    fontSize: 12,
  },
});

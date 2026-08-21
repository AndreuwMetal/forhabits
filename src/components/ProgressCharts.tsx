import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from './GlassCard';
import {
  DayPoint,
  HabitPoint,
  WeekdayPoint,
  averagePct,
  dailySeries,
  habitCompletion,
  weekdayCompletion,
} from '../charts';
import { useStore } from '../store';
import { WEEKDAY_LETTERS, useI18n } from '../i18n';
import { theme } from '../theme';

type Range = 7 | 30 | 90;
const RANGES: Range[] = [7, 30, 90];
const CHART_HEIGHT = 100;

/** Panel premium: evolución del cumplimiento del usuario en el tiempo. */
export default function ProgressCharts() {
  const { habits, logs } = useStore();
  const { t, lang } = useI18n();
  const [range, setRange] = useState<Range>(7);

  const today = useMemo(() => new Date(), []);
  const series = useMemo(() => dailySeries(habits, logs, range, today), [habits, logs, range, today]);
  const byHabit = useMemo(() => habitCompletion(habits, logs, range, today), [habits, logs, range, today]);
  const byWeekday = useMemo(() => weekdayCompletion(habits, logs, range, today), [habits, logs, range, today]);
  const avg = useMemo(() => averagePct(series), [series]);

  const hasData = habits.length > 0;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>📈 {t('chartsTitle')}</Text>
          <Text style={styles.subtitle}>{t('chartsSubtitle')}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✦ {t('premiumBadge')}</Text>
        </View>
      </View>

      {!hasData ? (
        <GlassCard style={styles.emptyCard}>
          <Text style={styles.emptyText}>{t('chartsEmpty')}</Text>
        </GlassCard>
      ) : (
        <>
          <View style={styles.rangeRow}>
            <Text style={styles.rangeLabel}>{t('chartsRange')}</Text>
            <View style={styles.rangeChips}>
              {RANGES.map((r) => (
                <Pressable
                  key={r}
                  style={[styles.chip, range === r && styles.chipActive]}
                  onPress={() => setRange(r)}
                >
                  <Text style={[styles.chipText, range === r && styles.chipTextActive]}>{r}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* 1. Cumplimiento diario */}
          <View>
            <View style={styles.chartHeaderRow}>
              <Text style={styles.sectionTitle}>{t('chartsCompletion')}</Text>
              {avg !== null && (
                <Text style={styles.avgText}>
                  {t('chartsAverage')} <Text style={styles.avgValue}>{avg}%</Text>
                </Text>
              )}
            </View>
            <GlassCard style={styles.card}>
              {range === 90 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <DailyBars series={series} avg={avg} range={range} />
                </ScrollView>
              ) : (
                <DailyBars series={series} avg={avg} range={range} />
              )}
            </GlassCard>
          </View>

          {/* 2. Cumplimiento por hábito */}
          <View>
            <Text style={styles.sectionTitle}>{t('chartsByHabit')}</Text>
            <GlassCard style={styles.card}>
              {byHabit.map((point) => (
                <HabitBarRow key={point.habit.id} point={point} />
              ))}
            </GlassCard>
          </View>

          {/* 3. Cumplimiento por día de la semana */}
          <View>
            <Text style={styles.sectionTitle}>{t('chartsByWeekday')}</Text>
            <GlassCard style={styles.card}>
              <WeekdayBars points={byWeekday} letters={WEEKDAY_LETTERS[lang]} />
            </GlassCard>
          </View>
        </>
      )}
    </View>
  );
}

function barWidth(range: Range): number {
  if (range === 7) return 26;
  if (range === 30) return 9;
  return 7;
}

function DailyBars({ series, avg, range }: { series: DayPoint[]; avg: number | null; range: Range }) {
  const showLabels = range !== 90;
  const w = barWidth(range);
  return (
    <View>
      <View style={styles.dailyChartArea}>
        {avg !== null && (
          <View
            pointerEvents="none"
            style={[styles.avgLine, { bottom: Math.max(1, Math.round((avg / 100) * CHART_HEIGHT)) }]}
          />
        )}
        <View style={styles.dailyRow}>
          {series.map((p) => (
            <View key={p.dateKey} style={[styles.dailyTrack, { width: w }]}>
              {p.pct === null ? (
                <View style={[styles.dailyBarEmpty, { width: w }]} />
              ) : (
                <LinearGradient
                  colors={[...theme.gradients.progress]}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 0, y: 0 }}
                  style={[
                    styles.dailyBar,
                    { width: w, height: Math.max(4, Math.round((p.pct / 100) * CHART_HEIGHT)) },
                  ]}
                />
              )}
            </View>
          ))}
        </View>
      </View>
      {showLabels && (
        <View style={styles.dailyLabelRow}>
          {series.map((p) => (
            <Text key={p.dateKey} style={[styles.dailyLabel, { width: w }]}>
              {Number(p.dateKey.slice(-2))}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

function HabitBarRow({ point }: { point: HabitPoint }) {
  const pct = point.pct ?? 0;
  return (
    <View style={styles.habitRow}>
      <Text style={styles.habitEmoji}>{point.habit.emoji}</Text>
      <Text style={styles.habitName} numberOfLines={1}>
        {point.habit.name}
      </Text>
      <View style={styles.habitTrack}>
        <LinearGradient
          colors={[...theme.gradients.progress]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.habitFill, { width: `${pct}%` }]}
        />
      </View>
      <Text style={styles.habitPct}>{point.pct === null ? '–' : `${point.pct}%`}</Text>
    </View>
  );
}

function WeekdayBars({ points, letters }: { points: WeekdayPoint[]; letters: string[] }) {
  return (
    <View style={styles.weekdayRow}>
      {points.map((p, i) => (
        <View key={p.weekday} style={styles.weekdayCol}>
          <Text style={styles.weekdayValue}>{p.pct === null ? '–' : `${p.pct}%`}</Text>
          <View style={styles.weekdayTrack}>
            {p.pct === null ? (
              <View style={styles.weekdayBarEmpty} />
            ) : (
              <LinearGradient
                colors={[...theme.gradients.progress]}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0 }}
                style={[styles.weekdayBar, { height: Math.max(4, Math.round((p.pct / 100) * CHART_HEIGHT)) }]}
              />
            )}
          </View>
          <Text style={styles.weekdayLabel}>{letters[i]}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  headerText: { flex: 1, gap: 2 },
  title: { color: theme.colors.text, fontSize: 18, fontWeight: '900' },
  subtitle: { color: theme.colors.subtext, fontSize: 13 },
  badge: {
    backgroundColor: 'rgba(0,229,255,0.12)',
    borderColor: 'rgba(0,229,255,0.4)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { color: theme.colors.cyan, fontSize: 10.5, fontWeight: '900', letterSpacing: 1 },
  emptyCard: { padding: 18 },
  emptyText: { color: theme.colors.subtext, fontSize: 14, textAlign: 'center' },

  rangeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rangeLabel: {
    color: theme.colors.subtext,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  rangeChips: { flexDirection: 'row', gap: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: theme.colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { fontSize: 13, color: theme.colors.text, fontWeight: '700' },
  chipTextActive: { color: '#fff' },

  sectionTitle: {
    color: theme.colors.subtext,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avgText: { color: theme.colors.subtext, fontSize: 12, fontWeight: '700', marginBottom: 6 },
  avgValue: { color: theme.colors.cyan, fontWeight: '900' },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
  },

  dailyChartArea: { height: CHART_HEIGHT },
  avgLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 0,
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: theme.colors.cyan,
  },
  dailyRow: { flexDirection: 'row', alignItems: 'flex-end', height: CHART_HEIGHT, gap: 3 },
  dailyTrack: { height: CHART_HEIGHT, justifyContent: 'flex-end' },
  dailyBar: { borderRadius: 4 },
  dailyBarEmpty: { height: 3, borderRadius: 2, backgroundColor: theme.colors.border },
  dailyLabelRow: { flexDirection: 'row', gap: 3, marginTop: 4 },
  dailyLabel: { fontSize: 8, color: theme.colors.subtext, textAlign: 'center' },

  habitRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7 },
  habitEmoji: { fontSize: 16, width: 20 },
  habitName: { width: 84, color: theme.colors.text, fontSize: 13, fontWeight: '600' },
  habitTrack: {
    flex: 1,
    height: 10,
    borderRadius: 6,
    backgroundColor: theme.colors.card,
    overflow: 'hidden',
  },
  habitFill: { height: '100%', borderRadius: 6 },
  habitPct: { width: 38, textAlign: 'right', color: theme.colors.subtext, fontSize: 12, fontWeight: '700' },

  weekdayRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: 4,
  },
  weekdayCol: { alignItems: 'center', flex: 1 },
  weekdayValue: { color: theme.colors.subtext, fontSize: 10.5, fontWeight: '700', marginBottom: 3 },
  weekdayTrack: { height: CHART_HEIGHT, justifyContent: 'flex-end' },
  weekdayBar: { width: 22, borderRadius: 6 },
  weekdayBarEmpty: { width: 22, height: 3, borderRadius: 2, backgroundColor: theme.colors.border },
  weekdayLabel: { color: theme.colors.text, fontSize: 13, fontWeight: '800', marginTop: 5 },
});

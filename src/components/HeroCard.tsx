import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from './GlassCard';
import { Habit, Logs, formatDayTitleEs } from '../types';
import { currentStreak, todayProgress } from '../stats';
import { theme } from '../theme';

interface Props {
  habits: Habit[];
  logs: Logs;
}

/** Panel superior con el progreso de hoy y la racha actual */
export default function HeroCard({ habits, logs }: Props) {
  const { done, total } = todayProgress(habits, logs);
  const streak = currentStreak(habits, logs);
  const pct = total === 0 ? 0 : done / total;

  return (
    <GlassCard style={styles.card} glow={theme.colors.primary}>
      <LinearGradient
        colors={[...theme.gradients.hero]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.inner}
      >
        <View style={styles.topRow}>
          <Text style={styles.date}>{formatDayTitleEs(new Date())}</Text>
          <View style={styles.streakChip}>
            <Text style={styles.streakText}>🔥 {streak}</Text>
          </View>
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.bigNumber}>
            {done}
            <Text style={styles.bigTotal}>/{total}</Text>
          </Text>
          <Text style={styles.progressLabel}>
            {total === 0
              ? 'crea tu primer hábito'
              : done === total
                ? '¡día completado! 🎉'
                : 'hábitos de hoy'}
          </Text>
        </View>
        <View style={styles.barTrack}>
          <LinearGradient
            colors={[...theme.gradients.progress]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.barFill, { width: `${Math.max(pct * 100, 2)}%` }]}
          />
        </View>
      </LinearGradient>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginTop: 8 },
  inner: { padding: 18 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    color: theme.colors.subtext,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  streakChip: {
    backgroundColor: 'rgba(255,214,10,0.15)',
    borderColor: 'rgba(255,214,10,0.45)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  streakText: { color: '#FFD60A', fontWeight: '800', fontSize: 13 },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  bigNumber: { color: theme.colors.text, fontSize: 44, fontWeight: '900' },
  bigTotal: { color: theme.colors.subtext, fontSize: 26, fontWeight: '700' },
  progressLabel: {
    color: theme.colors.subtext,
    fontSize: 14,
    marginBottom: 10,
    fontWeight: '600',
  },
  barTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 12,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 999 },
});

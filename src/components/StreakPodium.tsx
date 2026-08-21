import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from './GlassCard';
import { podium, PodiumEntry } from '../podium';
import { useStore } from '../store';
import { useI18n } from '../i18n';
import { theme } from '../theme';

const MEDALS = ['🥇', '🥈', '🥉'];
const MEDAL_COLORS = ['#FFD60A', '#C7CDD6', '#CD7F32'];
const MEDAL_GRADIENTS: readonly [string, string][] = [
  ['rgba(255,214,10,0.30)', 'rgba(255,214,10,0.06)'],
  ['rgba(199,205,214,0.28)', 'rgba(199,205,214,0.06)'],
  ['rgba(205,127,50,0.30)', 'rgba(205,127,50,0.06)'],
];

/** Podio de rachas: los hábitos del usuario ordenados por racha actual. */
export default function StreakPodium() {
  const { habits, logs } = useStore();
  const { t } = useI18n();

  const entries = useMemo(() => podium(habits, logs), [habits, logs]);
  const isEmpty = entries.length === 0 || entries.every((e) => e.current === 0);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>🏆 {t('podiumTitle')}</Text>
          <Text style={styles.subtitle}>{t('podiumSubtitle')}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✦ {t('premiumBadge')}</Text>
        </View>
      </View>

      {isEmpty ? (
        <GlassCard style={styles.emptyCard}>
          <Text style={styles.emptyText}>{t('podiumEmpty')}</Text>
        </GlassCard>
      ) : (
        <>
          <View style={styles.top3}>
            {top3.map((entry, i) => (
              <PodiumCard key={entry.habit.id} entry={entry} rank={i} />
            ))}
          </View>

          {rest.length > 0 && (
            <View style={styles.restBlock}>
              <Text style={styles.restTitle}>{t('podiumRest')}</Text>
              <GlassCard style={styles.restCard}>
                {rest.map((entry, i) => (
                  <View
                    key={entry.habit.id}
                    style={[styles.restRow, i > 0 && styles.restRowBorder]}
                  >
                    <Text style={styles.restRank}>{i + 4}</Text>
                    <Text style={styles.restEmoji}>{entry.habit.emoji}</Text>
                    <Text style={styles.restName} numberOfLines={1}>
                      {entry.habit.name}
                    </Text>
                    <Text style={styles.restStat}>
                      {entry.current} {t('challengeDays')}
                    </Text>
                  </View>
                ))}
              </GlassCard>
            </View>
          )}
        </>
      )}
    </View>
  );
}

function PodiumCard({ entry, rank }: { entry: PodiumEntry; rank: number }) {
  const { t } = useI18n();
  const color = MEDAL_COLORS[rank];
  return (
    <GlassCard glow={color}>
      <LinearGradient
        colors={MEDAL_GRADIENTS[rank]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.podiumInner}
      >
        <Text style={styles.medal}>{MEDALS[rank]}</Text>
        <Text style={styles.podiumEmoji}>{entry.habit.emoji}</Text>
        <Text style={styles.podiumName} numberOfLines={1}>
          {entry.habit.name}
        </Text>
        <View style={styles.podiumStats}>
          <View style={styles.podiumStat}>
            <Text style={[styles.podiumStatValue, { color }]}>{entry.current}</Text>
            <Text style={styles.podiumStatLabel}>
              {t('podiumCurrent')} · {t('challengeDays')}
            </Text>
          </View>
          <View style={styles.podiumStat}>
            <Text style={styles.podiumStatValue}>{entry.best}</Text>
            <Text style={styles.podiumStatLabel}>
              {t('podiumBest')} · {t('challengeDays')}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </GlassCard>
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
  top3: { gap: 10 },
  podiumInner: { padding: 16, alignItems: 'center', gap: 4 },
  medal: { fontSize: 30 },
  podiumEmoji: { fontSize: 22, marginTop: 2 },
  podiumName: { color: theme.colors.text, fontSize: 16, fontWeight: '800', maxWidth: '90%' },
  podiumStats: { flexDirection: 'row', gap: 24, marginTop: 8 },
  podiumStat: { alignItems: 'center' },
  podiumStatValue: { color: theme.colors.text, fontSize: 22, fontWeight: '900' },
  podiumStatLabel: { color: theme.colors.subtext, fontSize: 10.5, marginTop: 2 },
  restBlock: { gap: 6 },
  restTitle: {
    color: theme.colors.subtext,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  restCard: { paddingHorizontal: 12 },
  restRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 },
  restRowBorder: { borderTopWidth: 1, borderTopColor: theme.colors.border },
  restRank: { color: theme.colors.subtext, fontSize: 12.5, fontWeight: '800', width: 18 },
  restEmoji: { fontSize: 17 },
  restName: { flex: 1, color: theme.colors.text, fontSize: 14.5, fontWeight: '600' },
  restStat: { color: theme.colors.subtext, fontSize: 12.5, fontWeight: '700' },
});

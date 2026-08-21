import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from './GlassCard';
import { useStore } from '../store';
import { useI18n } from '../i18n';
import { Habit, Logs, formatDateEs } from '../types';
import { theme } from '../theme';
import {
  ActiveChallenge,
  CHALLENGES,
  CHALLENGES_KEY,
  ChallengeDef,
  buildRanking,
  challengeDayIndex,
  challengeTitle,
  fillDayOf,
  findChallenge,
  isFinished,
  medalFor,
  parseActive,
  topWithUser,
  userCompletedDays,
} from '../challenges';

const RANKING_LIMIT = 8;

export default function ChallengesPanel() {
  const { habits, logs } = useStore();
  const { lang, t } = useI18n();
  const [active, setActive] = useState<ActiveChallenge[]>([]);
  const [picking, setPicking] = useState<ChallengeDef | null>(null);

  // ponytail: el ranking solo depende del día, así que fijamos la fecha al montar;
  // el techo es que no se refresca solo al cruzar medianoche con la app abierta.
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    AsyncStorage.getItem(CHALLENGES_KEY)
      .then((raw) => setActive(parseActive(raw)))
      .catch(() => {});
  }, []);

  const persist = (next: ActiveChallenge[]) => {
    setActive(next);
    AsyncStorage.setItem(CHALLENGES_KEY, JSON.stringify(next)).catch(() => {});
  };

  const join = (habitId: string) => {
    if (!picking) return;
    persist([
      ...active,
      { challengeId: picking.id, habitId, startedAt: new Date().toISOString() },
    ]);
    setPicking(null);
  };

  const leave = (challengeId: string) =>
    persist(active.filter((a) => a.challengeId !== challengeId));

  const joinedIds = active.map((a) => a.challengeId);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 {t('challengesTitle')}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{t('premiumBadge')}</Text>
        </View>
      </View>
      <Text style={styles.subtitle}>{t('challengesSubtitle')}</Text>

      <Text style={styles.section}>{t('challengesActive')}</Text>
      {active.length === 0 ? (
        <Text style={styles.empty}>{t('challengesEmpty')}</Text>
      ) : (
        active.map((a) => {
          const def = findChallenge(a.challengeId);
          if (!def) return null;
          return (
            <ActiveCard
              key={a.challengeId}
              def={def}
              active={a}
              habits={habits}
              logs={logs}
              today={today}
              onLeave={() => leave(a.challengeId)}
            />
          );
        })
      )}

      <Text style={styles.section}>{t('challengesCatalog')}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catalog}
      >
        {CHALLENGES.map((def) => {
          const joined = joinedIds.includes(def.id);
          const blocked = joined || habits.length === 0;
          return (
            <GlassCard key={def.id} style={styles.catalogCard}>
              <Text style={styles.catalogEmoji}>{def.emoji}</Text>
              <Text style={styles.catalogTitle}>{challengeTitle(def, lang)}</Text>
              <Text style={styles.catalogMeta}>
                {def.days} {t('challengeDays')} · {def.participants}{' '}
                {t('challengeParticipants')}
              </Text>
              <Pressable
                style={[styles.joinBtn, blocked && styles.joinBtnOff]}
                disabled={blocked}
                onPress={() => setPicking(def)}
              >
                {joined ? (
                  <Text style={styles.joinedText}>✓ {t('challengeJoined')}</Text>
                ) : (
                  <LinearGradient
                    colors={[...theme.gradients.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.joinFill}
                  >
                    <Text style={styles.joinText}>{t('challengeJoin')}</Text>
                  </LinearGradient>
                )}
              </Pressable>
            </GlassCard>
          );
        })}
      </ScrollView>

      {habits.length === 0 && (
        <Text style={styles.noHabits}>{t('challengeNoHabits')}</Text>
      )}

      <Modal
        visible={picking !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPicking(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setPicking(null)} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>{t('challengePickHabit')}</Text>
          <Text style={styles.sheetSub}>
            {picking ? `${picking.emoji} ${challengeTitle(picking, lang)}` : ''}
          </Text>
          <ScrollView style={styles.pickList}>
            {habits.map((h) => (
              <Pressable key={h.id} style={styles.pickRow} onPress={() => join(h.id)}>
                <Text style={styles.pickEmoji}>{h.emoji}</Text>
                <Text style={styles.pickName} numberOfLines={1}>
                  {h.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <Pressable style={styles.cancelBtn} onPress={() => setPicking(null)}>
            <Text style={styles.cancelText}>{t('cancel')}</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

interface ActiveCardProps {
  def: ChallengeDef;
  active: ActiveChallenge;
  habits: Habit[];
  logs: Logs;
  today: Date;
  onLeave: () => void;
}

function ActiveCard({ def, active, habits, logs, today, onLeave }: ActiveCardProps) {
  const { lang, t } = useI18n();
  const habit = habits.find((h) => h.id === active.habitId);
  const day = challengeDayIndex(active.startedAt, def.days, today);
  const done = userCompletedDays(logs, active.habitId, active.startedAt, def.days, today);
  const finished = isFinished(active.startedAt, def.days, today);
  const ranking = useMemo(
    () => buildRanking(def, active, logs, today),
    [def, active, logs, today]
  );
  const rows = topWithUser(ranking, RANKING_LIMIT);
  const pct = Math.min(1, done / def.days);

  return (
    <GlassCard style={styles.activeCard} glow={theme.colors.primary}>
      <LinearGradient
        colors={[...theme.gradients.hero]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.activeInner}
      >
        <View style={styles.activeTop}>
          <Text style={styles.activeEmoji}>{def.emoji}</Text>
          <View style={styles.activeTitleBox}>
            <Text style={styles.activeTitle} numberOfLines={2}>
              {challengeTitle(def, lang)}
            </Text>
            <Text style={styles.activeMeta}>
              {habit ? `${habit.emoji} ${habit.name}` : '—'} ·{' '}
              {formatDateEs(new Date(active.startedAt))}
            </Text>
          </View>
        </View>

        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>{t('challengeProgress')}</Text>
          <Text style={styles.progressValue}>
            {done}/{def.days}
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
        <Text style={styles.dayOf}>
          {finished
            ? `🎉 ${t('challengeFinished')}`
            : fillDayOf(t('challengeDayOf'), day, def.days)}
        </Text>

        <Text style={styles.rankTitle}>{t('challengeRanking')}</Text>
        {rows.map((e) => {
          const pos = ranking.indexOf(e) + 1;
          return (
            <View key={e.id} style={[styles.rankRow, e.isUser && styles.rankRowYou]}>
              <Text style={styles.rankPos}>{medalFor(pos - 1) || pos}</Text>
              <Text style={styles.rankEmoji}>{e.emoji}</Text>
              <Text
                style={[styles.rankName, e.isUser && styles.rankNameYou]}
                numberOfLines={1}
              >
                {e.isUser ? t('challengeYou') : e.name}
              </Text>
              <Text style={[styles.rankDone, e.isUser && styles.rankNameYou]}>
                {e.done}
              </Text>
            </View>
          );
        })}
        <Text style={styles.simNote}>ℹ️ {t('challengeSimulatedNote')}</Text>

        <Pressable style={styles.leaveBtn} onPress={onLeave}>
          <Text style={styles.leaveText}>{t('challengeLeave')}</Text>
        </Pressable>
      </LinearGradient>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 16, marginTop: 8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1, fontSize: 19, fontWeight: '800', color: theme.colors.text },
  badge: {
    borderWidth: 1,
    borderColor: 'rgba(176,38,255,0.55)',
    backgroundColor: 'rgba(176,38,255,0.16)',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  badgeText: {
    color: theme.colors.primary,
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subtitle: { color: theme.colors.subtext, fontSize: 13.5, marginTop: 4, lineHeight: 19 },
  section: {
    color: theme.colors.subtext,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 18,
    marginBottom: 8,
  },
  empty: { color: theme.colors.subtext, fontSize: 13.5 },
  noHabits: { color: '#FFD60A', fontSize: 13, marginTop: 10, lineHeight: 18 },

  // catálogo horizontal
  catalog: { gap: 12, paddingRight: 4, paddingVertical: 2 },
  catalogCard: { width: 176, padding: 14 },
  catalogEmoji: { fontSize: 26 },
  catalogTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 6,
    minHeight: 38,
  },
  catalogMeta: { color: theme.colors.subtext, fontSize: 11.5, marginTop: 2 },
  joinBtn: { marginTop: 12, borderRadius: 999, overflow: 'hidden' },
  joinBtnOff: { opacity: 0.5 },
  joinFill: { paddingVertical: 9, alignItems: 'center' },
  joinText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  joinedText: {
    textAlign: 'center',
    paddingVertical: 9,
    color: theme.colors.success,
    fontWeight: '800',
    fontSize: 13,
  },

  // reto activo
  activeCard: { marginBottom: 12 },
  activeInner: { padding: 16 },
  activeTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  activeEmoji: { fontSize: 28 },
  activeTitleBox: { flex: 1 },
  activeTitle: { color: theme.colors.text, fontSize: 16.5, fontWeight: '800' },
  activeMeta: { color: theme.colors.subtext, fontSize: 12, marginTop: 2 },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 14,
  },
  progressLabel: {
    color: theme.colors.subtext,
    fontSize: 11.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressValue: { color: theme.colors.text, fontSize: 18, fontWeight: '900' },
  barTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 6,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 999 },
  dayOf: { color: theme.colors.cyan, fontSize: 12.5, fontWeight: '700', marginTop: 6 },
  rankTitle: {
    color: theme.colors.subtext,
    fontSize: 11.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 4,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  rankRowYou: {
    backgroundColor: 'rgba(0,229,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.45)',
  },
  rankPos: { width: 24, fontSize: 14, fontWeight: '800', color: theme.colors.subtext },
  rankEmoji: { fontSize: 17 },
  rankName: { flex: 1, color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  rankNameYou: { color: theme.colors.cyan, fontWeight: '900' },
  rankDone: { color: theme.colors.subtext, fontSize: 14, fontWeight: '800' },
  simNote: {
    color: theme.colors.subtext,
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 10,
    fontStyle: 'italic',
  },
  leaveBtn: {
    marginTop: 14,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,59,107,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,59,107,0.4)',
  },
  leaveText: { color: theme.colors.danger, fontWeight: '800', fontSize: 13.5 },

  // selector de hábito
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    backgroundColor: theme.colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '75%',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
  sheetSub: { fontSize: 13, color: theme.colors.subtext, marginTop: 2, marginBottom: 8 },
  pickList: { flexGrow: 0 },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  pickEmoji: { fontSize: 22 },
  pickName: { flex: 1, fontSize: 16, color: theme.colors.text, fontWeight: '600' },
  cancelBtn: {
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  cancelText: { color: theme.colors.subtext, fontWeight: '700' },
});

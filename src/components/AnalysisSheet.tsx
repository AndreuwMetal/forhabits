import React, { useMemo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AnalysisMode, buildAnalysis } from '../analysis';
import { useStore } from '../store';
import { MONTHS, useI18n } from '../i18n';
import { formatDateEs, fromKey } from '../types';
import { theme } from '../theme';

export interface AnalysisRequest {
  mode: AnalysisMode;
  /** domingo en que se genera el análisis (YYYY-MM-DD) */
  sundayKey: string;
}

interface Props {
  request: AnalysisRequest | null;
  onClose: () => void;
}

const CHART_HEIGHT = 120;

function gradeColor(grade: number): string {
  if (grade >= 7) return theme.colors.success;
  if (grade >= 4) return '#FFD60A';
  return theme.colors.danger;
}

export default function AnalysisSheet({ request, onClose }: Props) {
  const { habits, logs } = useStore();
  const { lang, t } = useI18n();

  const analysis = useMemo(
    () =>
      request ? buildAnalysis(habits, logs, request.mode, request.sundayKey) : null,
    [request, habits, logs]
  );

  if (!request || !analysis) return null;

  const sunday = fromKey(request.sundayKey);
  const title =
    request.mode === 'weekly'
      ? `${t('weeklyAnalysis')} | ${formatDateEs(sunday)}`
      : `${t('monthlyAnalysis')} | ${MONTHS[lang][sunday.getMonth()]} ${sunday.getFullYear()}`;
  const period = `${formatDateEs(analysis.start)} – ${formatDateEs(sunday)}`;
  const maxDone = Math.max(1, ...analysis.stats.map((s) => s.done));
  const goalReached = analysis.improvementPct >= analysis.goalPct;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>📊 {title}</Text>
        <Text style={styles.period}>{period}</Text>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* 1. Calificaciones */}
          <Text style={styles.sectionTitle}>{t('gradesTitle')}</Text>
          <View style={styles.card}>
            {analysis.stats.length === 0 ? (
              <Text style={styles.empty}>{t('historyEmpty')}</Text>
            ) : (
              analysis.stats.map(({ habit, due, done, grade }) => (
                <View key={habit.id} style={styles.gradeRow}>
                  <Text style={styles.gradeEmoji}>{habit.emoji}</Text>
                  <Text style={styles.gradeName} numberOfLines={1}>
                    {habit.name}
                  </Text>
                  <Text style={styles.gradeDetail}>
                    {done}/{due}
                  </Text>
                  <View
                    style={[styles.gradeBadge, { borderColor: gradeColor(grade) }]}
                  >
                    <Text style={[styles.gradeText, { color: gradeColor(grade) }]}>
                      {grade.toFixed(1).replace('.', ',')}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* 2. Gráfica de barras */}
          <Text style={styles.sectionTitle}>{t('repetitions')}</Text>
          <View style={styles.card}>
            <View style={styles.chart}>
              {analysis.stats.map(({ habit, done }) => (
                <View key={habit.id} style={styles.barCol}>
                  <Text style={styles.barValue}>{done}</Text>
                  <View style={styles.barTrack}>
                    <LinearGradient
                      colors={[...theme.gradients.progress]}
                      start={{ x: 0, y: 1 }}
                      end={{ x: 0, y: 0 }}
                      style={[
                        styles.bar,
                        {
                          height: Math.max(
                            4,
                            Math.round((done / maxDone) * CHART_HEIGHT)
                          ),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{habit.emoji}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 3. Mejora general (regla del 1% diario) */}
          <Text style={styles.sectionTitle}>{t('improvement')}</Text>
          <View style={[styles.card, styles.improveCard]}>
            <Text
              style={[
                styles.improvePct,
                { color: goalReached ? theme.colors.success : theme.colors.cyan },
              ]}
            >
              +{analysis.improvementPct.toFixed(1).replace('.', ',')}%
            </Text>
            <Text style={styles.improveGoal}>
              {t('improvementGoal')}: +{analysis.goalPct}%
            </Text>
            <View style={styles.improveTrack}>
              <LinearGradient
                colors={[...theme.gradients.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.improveFill,
                  {
                    width: `${Math.min(
                      100,
                      Math.round((analysis.improvementPct / Math.max(1, analysis.goalPct)) * 100)
                    )}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.improveExplain}>{t('improvementExplain')}</Text>
          </View>
        </ScrollView>

        <Pressable style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>{t('close')}</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    backgroundColor: theme.colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '88%',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
  period: { fontSize: 12.5, color: theme.colors.subtext, marginTop: 2, marginBottom: 8 },
  scroll: { flexGrow: 0 },
  sectionTitle: {
    color: theme.colors.subtext,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 6,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
  },
  empty: { color: theme.colors.subtext, fontSize: 13.5 },
  gradeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  gradeEmoji: { fontSize: 18 },
  gradeName: { flex: 1, color: theme.colors.text, fontSize: 15, fontWeight: '600' },
  gradeDetail: { color: theme.colors.subtext, fontSize: 12.5 },
  gradeBadge: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 46,
    alignItems: 'center',
  },
  gradeText: { fontWeight: '900', fontSize: 15 },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: 4,
  },
  barCol: { alignItems: 'center', flex: 1, maxWidth: 64 },
  barValue: { color: theme.colors.text, fontWeight: '800', fontSize: 13, marginBottom: 3 },
  barTrack: { height: CHART_HEIGHT, justifyContent: 'flex-end' },
  bar: { width: 26, borderRadius: 8 },
  barLabel: { fontSize: 17, marginTop: 5 },
  improveCard: { alignItems: 'center', paddingVertical: 16 },
  improvePct: { fontSize: 40, fontWeight: '900' },
  improveGoal: { color: theme.colors.subtext, fontSize: 13.5, marginTop: 2 },
  improveTrack: {
    height: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    alignSelf: 'stretch',
    marginTop: 12,
  },
  improveFill: { height: '100%', borderRadius: 999 },
  improveExplain: {
    color: theme.colors.subtext,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 10,
    textAlign: 'center',
  },
  closeBtn: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  closeText: { fontWeight: '700', color: theme.colors.text },
});

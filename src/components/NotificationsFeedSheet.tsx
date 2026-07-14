import React, { useMemo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { isLastSundayOfMonth, isSunday } from '../analysis';
import { useStore } from '../store';
import { MONTHS, formatDayTitle, useI18n } from '../i18n';
import { addDays, formatDateEs, isDueOn, toKey } from '../types';
import { theme } from '../theme';

const MAX_DAYS_BACK = 90;

export interface FeedEntry {
  kind: 'daily' | 'weekly' | 'monthly';
  dateKey: string;
  when: Date;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onOpenDaily: (dateKey: string) => void;
  onOpenAnalysis: (mode: 'weekly' | 'monthly', sundayKey: string) => void;
}

function parseNotifTime(time: string): { hour: number; minute: number } {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(time.trim());
  if (!m) return { hour: 21, minute: 0 };
  return { hour: Number(m[1]), minute: Number(m[2]) };
}

/**
 * Campanita: lista en orden (más reciente primero) las notificaciones
 * recibidas — DailyLogs diarios, análisis semanales de cada domingo y
 * análisis mensuales del último domingo del mes.
 */
export default function NotificationsFeedSheet({
  visible,
  onClose,
  onOpenDaily,
  onOpenAnalysis,
}: Props) {
  const { habits, logs, firstUse, notifTime } = useStore();
  const { lang, t } = useI18n();

  const entries = useMemo(() => {
    if (!visible) return [];
    const list: FeedEntry[] = [];
    const now = new Date();
    const first = new Date(firstUse);
    first.setHours(0, 0, 0, 0);
    const { hour, minute } = parseNotifTime(notifTime);

    let d = new Date();
    d.setHours(0, 0, 0, 0);
    for (let i = 0; i < MAX_DAYS_BACK && d >= first; i++) {
      const dateKey = toKey(d);
      // análisis mensual (último domingo del mes, 21:45)
      if (isLastSundayOfMonth(d)) {
        const when = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 21, 45);
        if (when <= now) list.push({ kind: 'monthly', dateKey, when });
      }
      // análisis semanal (domingo, 21:30)
      if (isSunday(d)) {
        const when = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 21, 30);
        if (when <= now) list.push({ kind: 'weekly', dateKey, when });
      }
      // DailyLog del día (a la hora configurada)
      if (habits.some((h) => isDueOn(h, d))) {
        const when = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour, minute);
        if (when <= now) list.push({ kind: 'daily', dateKey, when });
      }
      d = addDays(d, -1);
    }
    return list.sort((a, b) => b.when.getTime() - a.when.getTime());
  }, [visible, habits, firstUse, notifTime]);

  const entryTitle = (e: FeedEntry): string => {
    const date = new Date(e.when);
    if (e.kind === 'daily') return `DailyLog | ${formatDateEs(date)}`;
    if (e.kind === 'weekly') return `${t('weeklyAnalysis')} | ${formatDateEs(date)}`;
    return `${t('monthlyAnalysis')} | ${MONTHS[lang][date.getMonth()]} ${date.getFullYear()}`;
  };

  const entryIcon = (kind: FeedEntry['kind']) =>
    kind === 'daily' ? '🗒️' : kind === 'weekly' ? '📊' : '📈';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>🔔 {t('notificationsTitle')}</Text>
        {entries.length === 0 ? (
          <Text style={styles.empty}>{t('notifFeedEmpty')}</Text>
        ) : (
          <ScrollView style={styles.list}>
            {entries.map((e) => (
              <Pressable
                key={`${e.kind}-${e.dateKey}`}
                style={styles.row}
                onPress={() => {
                  onClose();
                  if (e.kind === 'daily') onOpenDaily(e.dateKey);
                  else onOpenAnalysis(e.kind, e.dateKey);
                }}
              >
                <Text style={styles.icon}>{entryIcon(e.kind)}</Text>
                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle}>{entryTitle(e)}</Text>
                  <Text style={styles.rowSub}>
                    {formatDayTitle(e.when, lang)} · {String(e.when.getHours()).padStart(2, '0')}:
                    {String(e.when.getMinutes()).padStart(2, '0')}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
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
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: '800', color: theme.colors.text, marginBottom: 10 },
  empty: { color: theme.colors.subtext, fontSize: 14, paddingVertical: 16 },
  list: { flexGrow: 0 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  icon: { fontSize: 20 },
  rowBody: { flex: 1 },
  rowTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  rowSub: { color: theme.colors.subtext, fontSize: 12, marginTop: 1 },
  chevron: { color: theme.colors.subtext, fontSize: 18 },
  closeBtn: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  closeText: { fontWeight: '700', color: theme.colors.text },
});

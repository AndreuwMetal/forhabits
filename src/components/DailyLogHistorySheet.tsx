import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Emoji from './Emoji';
import { useStore } from '../store';
import { formatDayTitle, useI18n } from '../i18n';
import { addDays, formatDateEs, isDueOn, toKey } from '../types';
import { theme } from '../theme';

const TIME_RE = /^([01]?\d|2[0-3]):[0-5]\d$/;
const MAX_DAYS = 60;

interface Props {
  visible: boolean;
  onClose: () => void;
}

/**
 * Historial de DailyLogs: el registro rellenado de cada día, más el
 * selector de la hora a la que se envía la notificación diaria.
 */
export default function DailyLogHistorySheet({ visible, onClose }: Props) {
  const { habits, logs, firstUse, notifTime, setNotifTime } = useStore();
  const { lang, t } = useI18n();
  const [timeDraft, setTimeDraft] = useState(notifTime);

  const timeValid = TIME_RE.test(timeDraft.trim());

  // al guardar la hora, la reprogramación se dispara automáticamente en Root
  const applyTime = (value: string) => {
    setTimeDraft(value);
    if (TIME_RE.test(value.trim())) setNotifTime(value.trim());
  };

  // días desde hoy hacia atrás hasta el primer uso (máx. MAX_DAYS), solo con hábitos programados
  const days = useMemo(() => {
    if (!visible) return [];
    const first = new Date(firstUse);
    first.setHours(0, 0, 0, 0);
    const list: { date: Date; key: string }[] = [];
    let d = new Date();
    d.setHours(0, 0, 0, 0);
    for (let i = 0; i < MAX_DAYS && d >= first; i++) {
      if (habits.some((h) => isDueOn(h, d))) {
        list.push({ date: new Date(d), key: toKey(d) });
      }
      d = addDays(d, -1);
    }
    return list;
  }, [visible, firstUse, habits]);

  const todayKey = toKey(new Date());

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>{t('historyTitle')}</Text>

        <View style={styles.timeCard}>
          <Text style={styles.timeTitle}>🔔 {t('notifTimeTitle')}</Text>
          <Text style={styles.timeLabel}>{t('notifTimeLabel')}</Text>
          <View style={styles.timeRow}>
            <TextInput
              style={[styles.timeInput, !timeValid && styles.timeInvalid]}
              value={timeDraft}
              onChangeText={applyTime}
              placeholder="21:00"
              placeholderTextColor={theme.colors.subtext}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />
            <Text style={styles.timeHint}>{t('notifTimeHint')}</Text>
          </View>
        </View>

        {days.length === 0 ? (
          <Text style={styles.empty}>{t('historyEmpty')}</Text>
        ) : (
          <ScrollView style={styles.list}>
            {days.map(({ date, key }) => {
              const log = logs[key] ?? {};
              const due = habits.filter((h) => isDueOn(h, date));
              return (
                <View key={key} style={styles.dayCard}>
                  <Text style={[styles.dayTitle, key === todayKey && styles.todayTitle]}>
                    DailyLog | {formatDateEs(date)}
                    <Text style={styles.daySub}>  ·  {formatDayTitle(date, lang)}</Text>
                  </Text>
                  {due.map((h) => {
                    const value = log[h.id];
                    const status =
                      value === true
                        ? { text: t('completed'), style: styles.stDone }
                        : value === false
                          ? { text: t('notCompleted'), style: styles.stNot }
                          : { text: t('unlogged'), style: styles.stNone };
                    return (
                      <View key={h.id} style={styles.habitRow}>
                        <Emoji size={17} dim={value !== true}>
                          {h.emoji}
                        </Emoji>
                        <Text style={styles.habitName} numberOfLines={1}>
                          {h.name}
                        </Text>
                        <Text style={[styles.status, status.style]}>{status.text}</Text>
                      </View>
                    );
                  })}
                </View>
              );
            })}
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
    maxHeight: '85%',
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
  timeCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    marginBottom: 12,
  },
  timeTitle: { color: theme.colors.text, fontWeight: '800', fontSize: 15 },
  timeLabel: { color: theme.colors.subtext, fontSize: 13, marginTop: 4 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  timeInput: {
    backgroundColor: theme.colors.card,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.cyan,
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: 92,
    textAlign: 'center',
  },
  timeInvalid: { borderColor: theme.colors.danger, color: theme.colors.danger },
  timeHint: { color: theme.colors.subtext, fontSize: 12, flex: 1 },
  empty: { color: theme.colors.subtext, fontSize: 14, paddingVertical: 16 },
  list: { flexGrow: 0 },
  dayCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
    marginBottom: 8,
  },
  dayTitle: { color: theme.colors.text, fontWeight: '800', fontSize: 14.5, marginBottom: 6 },
  todayTitle: { color: theme.colors.today },
  daySub: { color: theme.colors.subtext, fontWeight: '500', fontSize: 12.5 },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
  },
  habitName: { flex: 1, color: theme.colors.text, fontSize: 14.5 },
  status: { fontSize: 12.5, fontWeight: '800' },
  stDone: { color: theme.colors.success },
  stNot: { color: theme.colors.danger },
  stNone: { color: theme.colors.subtext },
  closeBtn: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  closeText: { fontWeight: '700', color: theme.colors.text },
});

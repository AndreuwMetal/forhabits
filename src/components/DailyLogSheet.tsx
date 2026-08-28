import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { DayLog, formatDateEs, fromKey, isDueOn } from '../types';
import { useStore } from '../store';
import { useI18n } from '../i18n';
import { theme } from '../theme';

interface Props {
  dateKey: string | null;
  onClose: () => void;
}

export default function DailyLogSheet({ dateKey, onClose }: Props) {
  const { t } = useI18n();
  const { habits, logs, saveDayLog } = useStore();
  const [draft, setDraft] = useState<DayLog>({});

  useEffect(() => {
    if (dateKey) setDraft(logs[dateKey] ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateKey]);

  if (!dateKey) return null;

  const date = fromKey(dateKey);
  const due = habits.filter((h) => isDueOn(h, date));

  const setValue = (habitId: string, done: boolean) =>
    setDraft((d) => ({ ...d, [habitId]: done }));

  const save = () => {
    saveDayLog(dateKey, draft);
    onClose();
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>DailyLog | {formatDateEs(date)}</Text>
        {due.length === 0 ? (
          <Text style={styles.empty}>{t('noHabitsThisDay')}</Text>
        ) : (
          <ScrollView style={styles.list}>
            {due.map((h) => {
              const value = draft[h.id];
              return (
                <View key={h.id} style={styles.row}>
                  <Text style={styles.emoji}>{h.emoji}</Text>
                  <Text style={styles.name} numberOfLines={1}>
                    {h.name}
                  </Text>
                  <View style={styles.segment}>
                    <Pressable
                      style={[styles.segBtn, value === true && styles.segDone]}
                      onPress={() => setValue(h.id, true)}
                    >
                      <Text
                        style={[styles.segText, value === true && styles.segTextOn]}
                      >
                        {t('completed')}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.segBtn, value === false && styles.segNot]}
                      onPress={() => setValue(h.id, false)}
                    >
                      <Text
                        style={[styles.segText, value === false && styles.segTextOn]}
                      >
                        {t('notCompleted')}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
        <View style={styles.actions}>
          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>{t('cancel')}</Text>
          </Pressable>
          {due.length > 0 && (
            <Pressable style={styles.saveBtn} onPress={save}>
              <Text style={styles.saveText}>{t('save')}</Text>
            </Pressable>
          )}
        </View>
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
  title: { fontSize: 19, fontWeight: '700', color: theme.colors.text, marginBottom: 10 },
  empty: { color: theme.colors.subtext, fontSize: 15, paddingVertical: 20 },
  list: { flexGrow: 0 },
  row: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  emoji: { fontSize: 22 },
  // En 360 px los botones dejaban 74 px al nombre y lo cortaban. Con un ancho
  // minimo, la fila (que ya es flexWrap) manda los botones a una segunda linea
  // y el nombre se lee entero.
  name: {
    flex: 1,
    minWidth: 150,
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  segment: { flexDirection: 'row', gap: 6, marginLeft: 'auto' },
  segBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
  },
  segDone: { backgroundColor: theme.colors.success },
  segNot: { backgroundColor: theme.colors.danger },
  segText: { fontSize: 12.5, fontWeight: '600', color: theme.colors.text },
  segTextOn: { color: '#fff' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  cancelText: { color: theme.colors.subtext, fontWeight: '600' },
  saveBtn: {
    flex: 2,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
  },
  saveText: { color: '#fff', fontWeight: '700' },
});

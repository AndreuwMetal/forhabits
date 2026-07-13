import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Periodicity } from '../types';
import { theme } from '../theme';

const EMOJIS = [
  '🏃', '📚', '🧘', '💪', '💧', '🥗', '😴', '🦷',
  '✍️', '🎸', '🎨', '🧠', '💻', '🌅', '🚭', '💰',
  '🧹', '🙏', '🚴', '🏊', '📵', '🌱', '❤️', '⭐',
];

const WEEKDAYS: { label: string; day: number }[] = [
  { label: 'L', day: 1 },
  { label: 'M', day: 2 },
  { label: 'X', day: 3 },
  { label: 'J', day: 4 },
  { label: 'V', day: 5 },
  { label: 'S', day: 6 },
  { label: 'D', day: 0 },
];

interface Props {
  onSave: (data: { name: string; emoji: string; periodicity: Periodicity }) => void;
}

export default function HabitForm({ onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState<string>('');
  const [daily, setDaily] = useState(true);
  const [days, setDays] = useState<number[]>([]);

  const valid = name.trim().length > 0 && emoji !== '' && (daily || days.length > 0);

  const reset = () => {
    setName('');
    setEmoji('');
    setDaily(true);
    setDays([]);
    setOpen(false);
  };

  const save = () => {
    if (!valid) return;
    onSave({
      name: name.trim(),
      emoji,
      periodicity: daily ? { type: 'daily' } : { type: 'weekdays', days },
    });
    reset();
  };

  const toggleDay = (d: number) =>
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );

  if (!open) {
    return (
      <Pressable style={styles.collapsed} onPress={() => setOpen(true)}>
        <Text style={styles.collapsedPlus}>＋</Text>
        <Text style={styles.collapsedText}>Develop a new habit</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Develop a new habit</Text>

      <Text style={styles.label}>Hábito</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Correr 10 minutos"
        placeholderTextColor={theme.colors.subtext}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Emoticono</Text>
      <View style={styles.emojiGrid}>
        {EMOJIS.map((e) => (
          <Pressable
            key={e}
            style={[styles.emojiCell, emoji === e && styles.emojiSelected]}
            onPress={() => setEmoji(e)}
          >
            <Text style={styles.emoji}>{e}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Periodicidad</Text>
      <View style={styles.periodRow}>
        <Pressable
          style={[styles.chip, daily && styles.chipActive]}
          onPress={() => setDaily(true)}
        >
          <Text style={[styles.chipText, daily && styles.chipTextActive]}>
            Todos los días
          </Text>
        </Pressable>
        <Pressable
          style={[styles.chip, !daily && styles.chipActive]}
          onPress={() => setDaily(false)}
        >
          <Text style={[styles.chipText, !daily && styles.chipTextActive]}>
            Días concretos
          </Text>
        </Pressable>
      </View>
      {!daily && (
        <View style={styles.daysRow}>
          {WEEKDAYS.map(({ label, day }) => (
            <Pressable
              key={day}
              style={[styles.dayChip, days.includes(day) && styles.chipActive]}
              onPress={() => toggleDay(day)}
            >
              <Text
                style={[
                  styles.chipText,
                  days.includes(day) && styles.chipTextActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        <Pressable style={styles.cancelBtn} onPress={reset}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>
        <Pressable
          style={[styles.saveBtn, !valid && styles.saveDisabled]}
          onPress={save}
          disabled={!valid}
        >
          <Text style={styles.saveText}>Guardar hábito</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  collapsed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    padding: 16,
    borderRadius: theme.radius,
    backgroundColor: theme.colors.surface,
  },
  collapsedPlus: { fontSize: 20, color: theme.colors.primary, fontWeight: '700' },
  collapsedText: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    padding: 16,
    borderRadius: theme.radius,
    backgroundColor: theme.colors.surface,
  },
  title: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  label: {
    marginTop: 14,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.subtext,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: theme.colors.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  emojiCell: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
  },
  emojiSelected: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: '#EDEDFC',
  },
  emoji: { fontSize: 20 },
  periodRow: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { fontSize: 14, color: theme.colors.text, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  daysRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  dayChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: theme.colors.card,
  },
  cancelText: { color: theme.colors.subtext, fontWeight: '600' },
  saveBtn: {
    flex: 2,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
  },
  saveDisabled: { opacity: 0.4 },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

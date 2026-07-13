import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Periodicity } from '../types';
import { EMOJI_CATEGORIES } from '../emojis';
import { theme } from '../theme';

const WEEKDAYS: { label: string; day: number }[] = [
  { label: 'L', day: 1 },
  { label: 'M', day: 2 },
  { label: 'X', day: 3 },
  { label: 'J', day: 4 },
  { label: 'V', day: 5 },
  { label: 'S', day: 6 },
  { label: 'D', day: 0 },
];

/** Extrae el último emoji (grafema) de un texto escrito con el teclado */
function lastGrapheme(text: string): string {
  const t = text.trim();
  if (!t) return '';
  const Seg = (Intl as any)?.Segmenter;
  if (Seg) {
    const segs = Array.from(new Seg('es', { granularity: 'grapheme' }).segment(t));
    const last = segs[segs.length - 1] as { segment: string } | undefined;
    return last?.segment ?? '';
  }
  const chars = Array.from(t);
  return chars[chars.length - 1] ?? '';
}

interface Props {
  onSave: (data: { name: string; emoji: string; periodicity: Periodicity }) => void;
}

export default function HabitForm({ onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState<string>('');
  const [customEmoji, setCustomEmoji] = useState('');
  const [category, setCategory] = useState(0);
  const [daily, setDaily] = useState(true);
  const [days, setDays] = useState<number[]>([]);

  const valid = name.trim().length > 0 && emoji !== '' && (daily || days.length > 0);

  const reset = () => {
    setName('');
    setEmoji('');
    setCustomEmoji('');
    setCategory(0);
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
      <View style={styles.emojiPickRow}>
        <View style={styles.emojiPreview}>
          <Text style={styles.emojiPreviewText}>{emoji || '·'}</Text>
        </View>
        <TextInput
          style={[styles.input, styles.emojiInput]}
          placeholder="Escribe cualquier emoji con tu teclado…"
          placeholderTextColor={theme.colors.subtext}
          value={customEmoji}
          onChangeText={(t) => {
            setCustomEmoji(t);
            const g = lastGrapheme(t);
            if (g) setEmoji(g);
          }}
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catBar}
        contentContainerStyle={styles.catBarContent}
      >
        {EMOJI_CATEGORIES.map((c, i) => (
          <Pressable
            key={c.name}
            style={[styles.catChip, category === i && styles.catChipActive]}
            onPress={() => setCategory(i)}
          >
            <Text style={[styles.catText, category === i && styles.catTextActive]}>
              {c.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView style={styles.emojiPane} nestedScrollEnabled>
        <View style={styles.emojiGrid}>
          {EMOJI_CATEGORIES[category].emojis.map((e, i) => (
            <Pressable
              key={`${e}-${i}`}
              style={[styles.emojiCell, emoji === e && styles.emojiSelected]}
              onPress={() => {
                setEmoji(e);
                setCustomEmoji('');
              }}
            >
              <Text style={styles.emoji}>{e}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

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
          style={[styles.saveWrap, !valid && styles.saveDisabled]}
          onPress={save}
          disabled={!valid}
        >
          <LinearGradient
            colors={[...theme.gradients.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveBtn}
          >
            <Text style={styles.saveText}>Guardar hábito</Text>
          </LinearGradient>
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
  emojiPickRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  emojiPreview: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  emojiPreviewText: { fontSize: 24, color: theme.colors.subtext },
  emojiInput: { flex: 1 },
  catBar: { marginTop: 10, flexGrow: 0 },
  catBarContent: { gap: 6 },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.card,
  },
  catChipActive: { backgroundColor: theme.colors.primary },
  catText: { fontSize: 13, color: theme.colors.subtext, fontWeight: '600' },
  catTextActive: { color: '#fff' },
  emojiPane: { maxHeight: 176, marginTop: 8 },
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
    backgroundColor: '#3A3A5C',
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
  saveWrap: { flex: 2, borderRadius: 12, overflow: 'hidden' },
  saveBtn: {
    padding: 12,
    alignItems: 'center',
  },
  saveDisabled: { opacity: 0.4 },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

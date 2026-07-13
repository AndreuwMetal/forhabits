import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { buildAdvice, AdviceMode, LawAdvice } from '../advisor';
import { useStore } from '../store';
import { theme } from '../theme';

export default function ApplyScreen() {
  const { habits } = useStore();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<AdviceMode>('build');
  const [advice, setAdvice] = useState<LawAdvice[] | null>(null);
  const [adviceFor, setAdviceFor] = useState('');
  const [openLaw, setOpenLaw] = useState<string | null>(null);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || advice) return [];
    return habits
      .filter((h) => h.name.toLowerCase().includes(q) && h.name !== query)
      .slice(0, 4);
  }, [query, habits, advice]);

  const consult = (name: string) => {
    const habit = name.trim();
    if (!habit) return;
    setQuery(habit);
    setAdviceFor(habit);
    setAdvice(buildAdvice(habit, mode));
    setOpenLaw(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>
          ¿Qué hábito quieres trabajar?
        </Text>
        <Text style={styles.subheading}>
          Te asesoro con las 4 leyes de Hábitos Atómicos de James Clear.
        </Text>

        <View style={styles.modeRow}>
          <Pressable
            style={[styles.modeChip, mode === 'build' && styles.modeActive]}
            onPress={() => {
              setMode('build');
              setAdvice(null);
            }}
          >
            <Text style={[styles.modeText, mode === 'build' && styles.modeTextOn]}>
              Adquirir hábito
            </Text>
          </Pressable>
          <Pressable
            style={[styles.modeChip, mode === 'break' && styles.modeActive]}
            onPress={() => {
              setMode('break');
              setAdvice(null);
            }}
          >
            <Text style={[styles.modeText, mode === 'break' && styles.modeTextOn]}>
              Eliminar hábito
            </Text>
          </Pressable>
        </View>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.search}
            placeholder="Ej: correr, leer, meditar…"
            placeholderTextColor={theme.colors.subtext}
            value={query}
            onChangeText={(t) => {
              setQuery(t);
              setAdvice(null);
            }}
            onSubmitEditing={() => consult(query)}
            returnKeyType="search"
          />
          <Pressable style={styles.goBtn} onPress={() => consult(query)}>
            <Text style={styles.goText}>Asesorar</Text>
          </Pressable>
        </View>

        {suggestions.length > 0 && (
          <View style={styles.suggestions}>
            {suggestions.map((h) => (
              <Pressable
                key={h.id}
                style={styles.suggestion}
                onPress={() => consult(h.name)}
              >
                <Text style={styles.suggestionText}>
                  {h.emoji} {h.name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {advice && (
          <View style={styles.results}>
            <Text style={styles.resultsTitle}>
              {mode === 'build' ? 'Para adquirir' : 'Para eliminar'} “{adviceFor}”
            </Text>
            {advice.map(({ law, items }) => {
              const color = theme.lawColors[law.id] ?? theme.colors.primary;
              const open = openLaw === law.id;
              return (
                <View key={law.id} style={[styles.lawCard, { borderLeftColor: color }]}>
                  <Pressable
                    style={styles.lawHeader}
                    onPress={() => setOpenLaw(open ? null : law.id)}
                  >
                    <View style={[styles.lawBadge, { backgroundColor: color }]}>
                      <Text style={styles.lawNumber}>{law.number}</Text>
                    </View>
                    <View style={styles.lawTitleBox}>
                      <Text style={styles.lawTitle}>{law.titleEs}</Text>
                      {!open && (
                        <Text style={styles.lawSummary} numberOfLines={2}>
                          {law.summary}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.chevron}>{open ? '▾' : '▸'}</Text>
                  </Pressable>
                  {open && (
                    <View style={styles.strategies}>
                      <Text style={styles.lawSummaryOpen}>{law.summary}</Text>
                      {items.map(({ strategy, applied }) => (
                        <View key={strategy.id} style={styles.strategy}>
                          <Text style={[styles.strategyTitle, { color }]}>
                            {strategy.title}
                          </Text>
                          <Text style={styles.strategyConcept}>{strategy.concept}</Text>
                          <View style={[styles.appliedBox, { borderColor: color }]}>
                            <Text style={styles.appliedText}>{applied}</Text>
                          </View>
                          <Text style={styles.exampleText}>💡 {strategy.example}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {!advice && habits.length > 0 && query.trim() === '' && (
          <View style={styles.quickList}>
            <Text style={styles.quickTitle}>Tus hábitos registrados</Text>
            {habits.map((h) => (
              <Pressable
                key={h.id}
                style={styles.suggestion}
                onPress={() => consult(h.name)}
              >
                <Text style={styles.suggestionText}>
                  {h.emoji} {h.name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 60 },
  heading: { fontSize: 22, fontWeight: '700', color: theme.colors.text },
  subheading: { fontSize: 14, color: theme.colors.subtext, marginTop: 4 },
  modeRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  modeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
  },
  modeActive: { backgroundColor: theme.colors.primary },
  modeText: { fontWeight: '600', color: theme.colors.text, fontSize: 14 },
  modeTextOn: { color: '#fff' },
  searchRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  search: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 16,
    color: theme.colors.text,
  },
  goBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  goText: { color: '#fff', fontWeight: '700' },
  suggestions: { marginTop: 8, gap: 6 },
  suggestion: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
  },
  suggestionText: { fontSize: 15, color: theme.colors.text },
  results: { marginTop: 20, gap: 12 },
  resultsTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
  lawCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  lawHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  lawBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lawNumber: { color: '#fff', fontWeight: '800', fontSize: 15 },
  lawTitleBox: { flex: 1 },
  lawTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  lawSummary: { fontSize: 12.5, color: theme.colors.subtext, marginTop: 2 },
  lawSummaryOpen: { fontSize: 13.5, color: theme.colors.subtext, marginBottom: 4 },
  chevron: { fontSize: 16, color: theme.colors.subtext },
  strategies: { paddingHorizontal: 14, paddingBottom: 14, gap: 14 },
  strategy: { gap: 5 },
  strategyTitle: { fontSize: 15, fontWeight: '700' },
  strategyConcept: { fontSize: 13.5, color: theme.colors.text, lineHeight: 19 },
  appliedBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    backgroundColor: theme.colors.card,
  },
  appliedText: { fontSize: 14, color: theme.colors.text, fontStyle: 'italic' },
  exampleText: { fontSize: 12.5, color: theme.colors.subtext, lineHeight: 18 },
  quickList: { marginTop: 24, gap: 6 },
  quickTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.subtext,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
});

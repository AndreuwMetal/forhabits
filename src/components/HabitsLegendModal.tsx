import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Habit, periodicityLabel } from '../types';
import { theme } from '../theme';

interface Props {
  visible: boolean;
  habits: Habit[];
  onClose: () => void;
  onDelete: (id: string) => void;
}

export default function HabitsLegendModal({
  visible,
  habits,
  onClose,
  onDelete,
}: Props) {
  const [infoId, setInfoId] = useState<string | null>(null);

  const confirmDelete = (h: Habit) => {
    if (Platform.OS === 'web') {
      onDelete(h.id);
      return;
    }
    Alert.alert('Eliminar hábito', `¿Eliminar "${h.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => onDelete(h.id) },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Habits</Text>
        {habits.length === 0 ? (
          <Text style={styles.empty}>
            Aún no tienes hábitos registrados. Crea el primero con “Develop a new
            habit”.
          </Text>
        ) : (
          <ScrollView style={styles.list}>
            {habits.map((h) => (
              <View key={h.id} style={styles.rowWrap}>
                <View style={styles.row}>
                  <Text style={styles.emoji}>{h.emoji}</Text>
                  <Text style={styles.name}>{h.name}</Text>
                  <Pressable
                    style={styles.infoBtn}
                    onPress={() => setInfoId(infoId === h.id ? null : h.id)}
                  >
                    <Text style={styles.infoText}>i</Text>
                  </Pressable>
                  <Pressable style={styles.deleteBtn} onPress={() => confirmDelete(h)}>
                    <Text style={styles.deleteText}>🗑</Text>
                  </Pressable>
                </View>
                {infoId === h.id && (
                  <Text style={styles.periodicity}>
                    Periodicidad estipulada: {periodicityLabel(h.periodicity)}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        )}
        <Pressable style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>Cerrar</Text>
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
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: '700', color: theme.colors.text, marginBottom: 10 },
  empty: { color: theme.colors.subtext, fontSize: 15, paddingVertical: 20 },
  list: { flexGrow: 0 },
  rowWrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    paddingVertical: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emoji: { fontSize: 22 },
  name: { flex: 1, fontSize: 16, color: theme.colors.text, fontWeight: '500' },
  infoBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    color: theme.colors.primary,
    fontStyle: 'italic',
    fontWeight: '700',
    fontSize: 14,
  },
  deleteBtn: { padding: 4 },
  deleteText: { fontSize: 16 },
  periodicity: {
    marginTop: 6,
    marginLeft: 34,
    color: theme.colors.subtext,
    fontSize: 14,
  },
  closeBtn: {
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  closeText: { fontWeight: '600', color: theme.colors.text },
});

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import RecordsScreen from './RecordsScreen';
import ApplyScreen from './ApplyScreen';
import { theme } from '../theme';

type Tab = 'records' | 'apply';

export default function MainScreen() {
  const [tab, setTab] = useState<Tab>('records');

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.segment}>
          <Pressable
            style={[styles.segBtn, tab === 'records' && styles.segActive]}
            onPress={() => setTab('records')}
          >
            <Text style={[styles.segText, tab === 'records' && styles.segTextActive]}>
              Records
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segBtn, tab === 'apply' && styles.segActive]}
            onPress={() => setTab('apply')}
          >
            <Text style={[styles.segText, tab === 'apply' && styles.segTextActive]}>
              Apply
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.body}>
        {/* Ambas pantallas se mantienen montadas para conservar su estado */}
        <View style={[styles.page, tab !== 'records' && styles.hidden]}>
          <RecordsScreen />
        </View>
        <View style={[styles.page, tab !== 'apply' && styles.hidden]}>
          <ApplyScreen />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  header: {
    paddingTop: 8,
    paddingBottom: 10,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 999,
    padding: 3,
  },
  segBtn: {
    paddingHorizontal: 28,
    paddingVertical: 8,
    borderRadius: 999,
  },
  segActive: {
    backgroundColor: theme.colors.card,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  segText: { fontSize: 15, fontWeight: '600', color: theme.colors.subtext },
  segTextActive: { color: theme.colors.text },
  body: { flex: 1 },
  page: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  hidden: { display: 'none' },
});

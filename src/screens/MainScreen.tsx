import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import RecordsScreen from './RecordsScreen';
import ApplyScreen from './ApplyScreen';
import { theme } from '../theme';

type Tab = 'records' | 'apply';

export default function MainScreen() {
  const [tab, setTab] = useState<Tab>('records');

  return (
    <LinearGradient colors={[...theme.gradients.backdrop]} style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.brand}>
          For<Text style={styles.brandAccent}>Habits</Text>
        </Text>
        <View style={styles.segment}>
          {(['records', 'apply'] as Tab[]).map((t) =>
            tab === t ? (
              <LinearGradient
                key={t}
                colors={[...theme.gradients.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.segActive}
              >
                <Text style={styles.segTextActive}>
                  {t === 'records' ? 'Records' : 'Apply'}
                </Text>
              </LinearGradient>
            ) : (
              <Pressable key={t} style={styles.segBtn} onPress={() => setTab(t)}>
                <Text style={styles.segText}>
                  {t === 'records' ? 'Records' : 'Apply'}
                </Text>
              </Pressable>
            )
          )}
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingTop: 6,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: 0.5,
  },
  brandAccent: { color: theme.colors.cyan },
  segment: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 999,
    padding: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  segBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
  },
  segActive: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
  },
  segText: { fontSize: 14, fontWeight: '700', color: theme.colors.subtext },
  segTextActive: { fontSize: 14, fontWeight: '800', color: '#fff' },
  body: { flex: 1 },
  page: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  hidden: { display: 'none' },
});

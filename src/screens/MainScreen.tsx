import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import RecordsScreen from './RecordsScreen';
import ApplyScreen from './ApplyScreen';
import NotificationsFeedSheet from '../components/NotificationsFeedSheet';
import AnalysisSheet, { AnalysisRequest } from '../components/AnalysisSheet';
import DailyLogSheet from '../components/DailyLogSheet';
import { LANGUAGES, useI18n } from '../i18n';
import { theme } from '../theme';

type Tab = 'records' | 'apply';

export default function MainScreen() {
  const [tab, setTab] = useState<Tab>('records');
  const [langMenu, setLangMenu] = useState(false);
  const [bellVisible, setBellVisible] = useState(false);
  const [feedDaily, setFeedDaily] = useState<string | null>(null);
  const [feedAnalysis, setFeedAnalysis] = useState<AnalysisRequest | null>(null);
  const { lang, setLang, t } = useI18n();

  const tabLabel = (x: Tab) => (x === 'records' ? t('tabRecords') : t('tabApply'));

  return (
    <LinearGradient colors={[...theme.gradients.backdrop]} style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.brand}>
          For<Text style={styles.brandAccent}>Habits</Text>
        </Text>
        <View style={styles.headerRight}>
          <View style={styles.segment}>
            {(['records', 'apply'] as Tab[]).map((x) =>
              tab === x ? (
                <LinearGradient
                  key={x}
                  colors={[...theme.gradients.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.segActive}
                >
                  <Text style={styles.segTextActive}>{tabLabel(x)}</Text>
                </LinearGradient>
              ) : (
                <Pressable key={x} style={styles.segBtn} onPress={() => setTab(x)}>
                  <Text style={styles.segText}>{tabLabel(x)}</Text>
                </Pressable>
              )
            )}
          </View>
          <Pressable style={styles.bellChip} onPress={() => setBellVisible(true)}>
            <Text style={styles.bellText}>🔔</Text>
          </Pressable>
          <Pressable style={styles.langChip} onPress={() => setLangMenu(true)}>
            <Text style={styles.langChipText}>
              🌐 {LANGUAGES.find((l) => l.code === lang)?.short}
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

      <NotificationsFeedSheet
        visible={bellVisible}
        onClose={() => setBellVisible(false)}
        onOpenDaily={(dateKey) => setFeedDaily(dateKey)}
        onOpenAnalysis={(mode, sundayKey) => setFeedAnalysis({ mode, sundayKey })}
      />
      <DailyLogSheet dateKey={feedDaily} onClose={() => setFeedDaily(null)} />
      <AnalysisSheet request={feedAnalysis} onClose={() => setFeedAnalysis(null)} />

      <Modal
        visible={langMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setLangMenu(false)}
      >
        <Pressable style={styles.menuBackdrop} onPress={() => setLangMenu(false)}>
          <View style={styles.menu}>
            <Text style={styles.menuTitle}>{t('language')}</Text>
            {LANGUAGES.map((l) => (
              <Pressable
                key={l.code}
                style={styles.menuItem}
                onPress={() => {
                  setLang(l.code);
                  setLangMenu(false);
                }}
              >
                <Text
                  style={[
                    styles.menuItemText,
                    lang === l.code && styles.menuItemActive,
                  ]}
                >
                  {l.label}
                </Text>
                {lang === l.code && <Text style={styles.menuCheck}>✓</Text>}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingTop: 6,
    paddingBottom: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: 0.5,
  },
  brandAccent: { color: theme.colors.cyan },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  segment: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 999,
    padding: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  segBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  segActive: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  segText: { fontSize: 13.5, fontWeight: '700', color: theme.colors.subtext },
  segTextActive: { fontSize: 13.5, fontWeight: '800', color: '#fff' },
  bellChip: {
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bellText: { fontSize: 14 },
  langChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  langChipText: { color: theme.colors.text, fontSize: 12.5, fontWeight: '800' },
  body: { flex: 1 },
  page: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  hidden: { display: 'none' },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 56,
    paddingRight: 14,
  },
  menu: {
    minWidth: 180,
    backgroundColor: '#17102B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 8,
  },
  menuTitle: {
    color: theme.colors.subtext,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
  },
  menuItemText: { color: theme.colors.text, fontSize: 15, fontWeight: '600' },
  menuItemActive: { color: theme.colors.cyan },
  menuCheck: { color: theme.colors.cyan, fontWeight: '900' },
});

import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ChallengesPanel from '../components/ChallengesPanel';
import StreakPodium from '../components/StreakPodium';
import ProgressCharts from '../components/ProgressCharts';
import { useStore } from '../store';
import { useI18n } from '../i18n';
import { theme } from '../theme';

export default function PremiumScreen() {
  const { isPremium, setPremium } = useStore();
  const { t } = useI18n();

  if (!isPremium) {
    return (
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[...theme.gradients.hero]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.upsell}
        >
          <Text style={styles.badge}>✦ {t('premiumBadge')}</Text>
          <Text style={styles.upsellTitle}>{t('premiumTitle')}</Text>
          <Text style={styles.upsellPitch}>{t('premiumPitch')}</Text>

          {(
            [
              ['🏁', t('premiumFeatureChallenges')],
              ['🥇', t('premiumFeaturePodium')],
              ['📈', t('premiumFeatureCharts')],
            ] as const
          ).map(([emoji, label]) => (
            <View key={label} style={styles.feature}>
              <Text style={styles.featureEmoji}>{emoji}</Text>
              <Text style={styles.featureText}>{label}</Text>
            </View>
          ))}

          <Pressable onPress={() => setPremium(true)}>
            <LinearGradient
              colors={[...theme.gradients.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cta}
            >
              <Text style={styles.ctaText}>{t('premiumUnlock')}</Text>
            </LinearGradient>
          </Pressable>
          <Text style={styles.note}>{t('premiumLocalNote')}</Text>
        </LinearGradient>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ChallengesPanel />
      <StreakPodium />
      <ProgressCharts />

      <View style={styles.footer}>
        <Text style={styles.footerText}>✦ {t('premiumActive')}</Text>
        <Pressable onPress={() => setPremium(false)}>
          <Text style={styles.footerLink}>{t('premiumDisable')}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  // el dock flotante de Registros ocupa la parte baja: deja aire al final
  content: { padding: 14, paddingBottom: 90, gap: 16 },
  upsell: {
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 20,
    gap: 10,
  },
  badge: {
    color: theme.colors.cyan,
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  upsellTitle: { color: theme.colors.text, fontSize: 24, fontWeight: '900' },
  upsellPitch: {
    color: theme.colors.subtext,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureEmoji: { fontSize: 18 },
  featureText: { color: theme.colors.text, fontSize: 15, fontWeight: '600', flex: 1 },
  cta: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  note: {
    color: theme.colors.subtext,
    fontSize: 11.5,
    lineHeight: 16,
    textAlign: 'center',
  },
  footer: { alignItems: 'center', gap: 6, paddingTop: 4 },
  footerText: { color: theme.colors.cyan, fontSize: 12.5, fontWeight: '800' },
  footerLink: {
    color: theme.colors.subtext,
    fontSize: 12.5,
    textDecorationLine: 'underline',
  },
});

import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Typewriter from '../components/Typewriter';
import { theme } from '../theme';

const QUOTE =
  'What is not defined cannot be measured. What is not measured cannot be improved. What is not improved always degrades.';
const AUTHOR = 'William Thomson Kelvin';

const { width } = Dimensions.get('window');

export default function IntroScreen({ onDone }: { onDone: () => void }) {
  const [typed, setTyped] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const authorOpacity = useRef(new Animated.Value(0)).current;
  const hintOpacity = useRef(new Animated.Value(0)).current;

  const finish = () => {
    Animated.timing(translateX, {
      toValue: -width,
      duration: 260,
      useNativeDriver: true,
    }).start(onDone);
  };

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 12,
      onPanResponderMove: (_e, g) => {
        if (g.dx < 0) translateX.setValue(g.dx);
      },
      onPanResponderRelease: (_e, g) => {
        if (g.dx < -60) {
          finish();
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const onTypedDone = () => {
    if (typed) return;
    setTyped(true);
    Animated.stagger(400, [
      Animated.timing(authorOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(hintOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Animated.View style={[styles.root, { transform: [{ translateX }] }]} {...pan.panHandlers}>
      <LinearGradient colors={[...theme.gradients.backdrop]} style={styles.fill}>
        <Pressable style={styles.pressable} onPress={() => typed && finish()}>
          {/* halos de neón */}
          <View style={styles.orbTop} pointerEvents="none" />
          <View style={styles.orbBottom} pointerEvents="none" />

          <Text style={styles.brand}>
            For<Text style={styles.brandAccent}>Habits</Text>
          </Text>

          <View style={styles.quoteBox}>
            <View style={styles.quoteAccent} />
            <Typewriter text={QUOTE} style={styles.quote} onDone={onTypedDone} />
            <Animated.Text style={[styles.author, { opacity: authorOpacity }]}>
              {AUTHOR}
            </Animated.Text>
          </View>

          <Animated.View style={[styles.hint, { opacity: hintOpacity }]}>
            <View style={styles.hintPill}>
              <Text style={styles.hintText}>Desliza para empezar</Text>
              <Text style={styles.hintArrow}>←</Text>
            </View>
          </Animated.View>
        </Pressable>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  fill: { flex: 1 },
  pressable: { flex: 1, justifyContent: 'center', padding: 32 },
  orbTop: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(176,38,255,0.22)',
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.9,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 0 },
  },
  orbBottom: {
    position: 'absolute',
    bottom: -100,
    left: -90,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(0,229,255,0.12)',
    shadowColor: theme.colors.cyan,
    shadowOpacity: 0.8,
    shadowRadius: 70,
    shadowOffset: { width: 0, height: 0 },
  },
  brand: {
    position: 'absolute',
    top: 24,
    alignSelf: 'center',
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: 2,
  },
  brandAccent: { color: theme.colors.cyan },
  quoteBox: { gap: 24 },
  quoteAccent: {
    width: 56,
    height: 4,
    borderRadius: 999,
    backgroundColor: theme.colors.today,
    shadowColor: theme.colors.today,
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  quote: {
    color: theme.colors.introText,
    fontSize: 26,
    lineHeight: 38,
    fontWeight: '600',
  },
  author: {
    color: theme.colors.cyan,
    fontSize: 17,
    fontStyle: 'italic',
    textAlign: 'right',
    textShadowColor: 'rgba(0,229,255,0.6)',
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 0 },
  },
  hint: {
    position: 'absolute',
    bottom: 48,
    alignSelf: 'center',
  },
  hintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,45,149,0.5)',
    shadowColor: theme.colors.today,
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  hintText: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  hintArrow: { color: theme.colors.today, fontSize: 17, fontWeight: '800' },
});

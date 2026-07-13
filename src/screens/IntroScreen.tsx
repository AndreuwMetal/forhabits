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
    <Animated.View
      style={[styles.root, { transform: [{ translateX }] }]}
      {...pan.panHandlers}
    >
      <Pressable style={styles.pressable} onPress={() => typed && finish()}>
        <View style={styles.quoteBox}>
          <Typewriter text={QUOTE} style={styles.quote} onDone={onTypedDone} />
          <Animated.Text style={[styles.author, { opacity: authorOpacity }]}>
            {AUTHOR}
          </Animated.Text>
        </View>
        <Animated.View style={[styles.hint, { opacity: hintOpacity }]}>
          <Text style={styles.hintText}>Desliza para empezar</Text>
          <Text style={styles.hintArrow}>←</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.introBg },
  pressable: { flex: 1, justifyContent: 'center', padding: 32 },
  quoteBox: { gap: 24 },
  quote: {
    color: theme.colors.introText,
    fontSize: 26,
    lineHeight: 38,
    fontFamily: 'serif',
  },
  author: {
    color: theme.colors.subtext,
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'right',
  },
  hint: {
    position: 'absolute',
    bottom: 48,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hintText: { color: theme.colors.subtext, fontSize: 14 },
  hintArrow: { color: theme.colors.subtext, fontSize: 18 },
});

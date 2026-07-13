import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
} from 'react-native';
import Typewriter from '../components/Typewriter';

const QUOTE =
  'What is not defined cannot be measured. What is not measured cannot be improved. What is not improved always degrades.';
const AUTHOR = 'William Thomson Kelvin';

const { width } = Dimensions.get('window');
const SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' });

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
    Animated.stagger(500, [
      Animated.timing(authorOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(hintOpacity, { toValue: 0.6, duration: 800, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Animated.View
      style={[styles.root, { transform: [{ translateX }] }]}
      {...pan.panHandlers}
    >
      <Pressable style={styles.pressable} onPress={() => typed && finish()}>
        <Typewriter
          text={QUOTE}
          style={styles.quote}
          cursorColor="#8A8A8E"
          onDone={onTypedDone}
        />
        <Animated.Text style={[styles.author, { opacity: authorOpacity }]}>
          {AUTHOR}
        </Animated.Text>
        <Animated.Text style={[styles.hint, { opacity: hintOpacity }]}>
          desliza para empezar
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000000' },
  pressable: { flex: 1, justifyContent: 'center', paddingHorizontal: 36 },
  quote: {
    color: '#F2F2F2',
    fontSize: 25,
    lineHeight: 40,
    fontFamily: SERIF,
  },
  author: {
    marginTop: 28,
    color: '#8A8A8E',
    fontSize: 17,
    fontStyle: 'italic',
    fontFamily: SERIF,
    textAlign: 'right',
  },
  hint: {
    position: 'absolute',
    bottom: 52,
    alignSelf: 'center',
    color: '#6E6E73',
    fontSize: 13,
    letterSpacing: 1,
  },
});

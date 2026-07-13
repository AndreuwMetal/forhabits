import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TextStyle } from 'react-native';

interface Props {
  text: string;
  speed?: number; // ms por carácter
  style?: TextStyle | TextStyle[];
  onDone?: () => void;
}

export default function Typewriter({ text, speed = 45, style, onDone }: Props) {
  const [count, setCount] = useState(0);
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  const done = count >= text.length;

  useEffect(() => {
    if (done) {
      onDone?.();
      return;
    }
    const t = setTimeout(() => setCount((c) => c + 1), speed);
    return () => clearTimeout(t);
  }, [count, done, speed, onDone]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, { toValue: 0, duration: 450, useNativeDriver: true }),
        Animated.timing(cursorOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [cursorOpacity]);

  return (
    <Text style={style}>
      {text.slice(0, count)}
      <Animated.Text style={[styles.cursor, { opacity: cursorOpacity }]}>▌</Animated.Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  cursor: { color: '#F5F5F0' },
});

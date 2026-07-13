import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  glow?: string; // color del halo opcional
}

/** Tarjeta "de cristal": translúcida, borde sutil y halo de color opcional */
export default function GlassCard({ children, style, glow }: Props) {
  return (
    <View
      style={[
        styles.card,
        glow
          ? {
              shadowColor: glow,
              shadowOpacity: 0.55,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 0 },
              elevation: 8,
            }
          : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
});

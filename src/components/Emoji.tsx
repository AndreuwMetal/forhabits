import React from 'react';
import { Platform, Text, TextStyle } from 'react-native';

interface Props {
  children: string;
  size?: number;
  /** true = pendiente (se muestra apagado / blanco y negro) */
  dim?: boolean;
  style?: TextStyle;
}

/**
 * Emoji que puede mostrarse "en blanco y negro" (pendiente) o a color
 * (completado). En web usa filtro de escala de grises real; en nativo se
 * aproxima bajando la opacidad.
 */
export default function Emoji({ children, size = 16, dim = false, style }: Props) {
  const dimStyle: TextStyle | undefined = dim
    ? Platform.OS === 'web'
      ? ({ filter: 'grayscale(1)', opacity: 0.55 } as unknown as TextStyle)
      : { opacity: 0.3 }
    : undefined;
  return (
    <Text style={[{ fontSize: size, lineHeight: size + 4 }, dimStyle, style]}>
      {children}
    </Text>
  );
}

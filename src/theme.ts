export const theme = {
  colors: {
    bg: '#07030F',
    surface: 'rgba(255,255,255,0.06)',
    card: 'rgba(255,255,255,0.10)',
    text: '#FFFFFF',
    subtext: '#9D93B8',
    border: 'rgba(255,255,255,0.14)',
    primary: '#B026FF',
    cyan: '#00E5FF',
    today: '#FF2D95',
    success: '#00FFA3',
    danger: '#FF3B6B',
    introBg: '#07030F',
    introText: '#F5F5F0',
  },
  gradients: {
    /** fondo general de las pantallas */
    backdrop: ['#1B0B3A', '#0D0520', '#07030F'] as const,
    /** acciones principales y elementos activos */
    primary: ['#B026FF', '#FF2D95'] as const,
    /** barra de progreso del día */
    progress: ['#00E5FF', '#00FFA3'] as const,
    /** hero del día */
    hero: ['rgba(176,38,255,0.35)', 'rgba(255,45,149,0.12)'] as const,
  },
  lawColors: {
    obvious: '#FFD60A',
    attractive: '#FF2D95',
    easy: '#00E5FF',
    satisfying: '#00FFA3',
  } as Record<string, string>,
  lawGradients: {
    obvious: ['#FFD60A', '#FF8A00'] as const,
    attractive: ['#FF2D95', '#B026FF'] as const,
    easy: ['#00E5FF', '#2979FF'] as const,
    satisfying: ['#00FFA3', '#00C853'] as const,
  } as Record<string, readonly [string, string]>,
  radius: 20,
  spacing: (n: number) => n * 4,
};

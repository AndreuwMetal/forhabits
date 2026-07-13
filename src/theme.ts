export const theme = {
  colors: {
    bg: '#FFFFFF',
    surface: '#F2F2F7',
    card: '#FFFFFF',
    text: '#111114',
    subtext: '#8E8E93',
    border: '#E5E5EA',
    primary: '#5E5CE6',
    today: '#FF3B30',
    success: '#34C759',
    danger: '#FF3B30',
    introBg: '#0B0B0F',
    introText: '#F5F5F0',
  },
  lawColors: {
    obvious: '#FFB800',
    attractive: '#FF2D55',
    easy: '#007AFF',
    satisfying: '#34C759',
  } as Record<string, string>,
  radius: 14,
  spacing: (n: number) => n * 4,
};

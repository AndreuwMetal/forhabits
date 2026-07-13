export const theme = {
  colors: {
    bg: '#000000',
    surface: '#1C1C1E',
    card: '#2C2C2E',
    text: '#FFFFFF',
    subtext: '#98989F',
    border: '#38383A',
    primary: '#5E5CE6',
    today: '#FF453A',
    success: '#30D158',
    danger: '#FF453A',
    introBg: '#000000',
    introText: '#F5F5F0',
  },
  lawColors: {
    obvious: '#FFD60A',
    attractive: '#FF375F',
    easy: '#0A84FF',
    satisfying: '#30D158',
  } as Record<string, string>,
  radius: 14,
  spacing: (n: number) => n * 4,
};

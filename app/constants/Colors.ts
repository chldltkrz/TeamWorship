export const Brand = {
  primary: '#6C63FF',
  primaryDark: '#5A52D5',
  primaryLight: '#A5A0FF',
  accent: '#43B89C',
  pink: '#FF6584',
  orange: '#F5A623',
};

export default {
  light: {
    text: '#1A1D2E',
    textSecondary: '#6B7084',
    background: '#F6F6FA',
    surface: '#FFFFFF',
    surfaceSecondary: '#F0F0F6',
    tint: Brand.primary,
    tabIconDefault: '#B0B3C6',
    tabIconSelected: Brand.primary,
    border: '#E4E5ED',
    success: Brand.accent,
    warning: Brand.orange,
    danger: Brand.pink,
  },
  dark: {
    text: '#E8E8F0',
    textSecondary: '#9496A8',
    background: '#0B0D17',
    surface: '#13152A',
    surfaceSecondary: '#1C1F38',
    tint: Brand.primaryLight,
    tabIconDefault: '#4A4D62',
    tabIconSelected: Brand.primaryLight,
    border: 'rgba(108, 99, 255, 0.15)',
    success: Brand.accent,
    warning: Brand.orange,
    danger: Brand.pink,
  },
};

import { StyleSheet, View, Text } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'default';
}

const variantColors = {
  success: { bg: 'rgba(67,184,156,0.15)', text: '#43B89C' },
  warning: { bg: 'rgba(245,166,35,0.15)', text: '#F5A623' },
  danger: { bg: 'rgba(255,101,132,0.15)', text: '#FF6584' },
  default: { bg: 'rgba(108,99,255,0.15)', text: '#A5A0FF' },
};

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const color = variantColors[variant];
  return (
    <View style={[styles.badge, { backgroundColor: color.bg }]}>
      <Text style={[styles.text, { color: color.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 50,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});

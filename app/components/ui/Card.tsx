import { StyleSheet, View, ViewProps } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, style, ...props }: CardProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  return (
    <View
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, style]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
});

import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {actionLabel && (
        <Pressable onPress={onAction}>
          <Text style={[styles.action, { color: colors.tint }]}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  action: {
    fontSize: 14,
    fontWeight: '600',
  },
});

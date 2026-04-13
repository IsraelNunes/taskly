import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  title: {
    fontWeight: '700',
    fontSize: 16,
    color: colors.text,
  },
  description: {
    textAlign: 'center',
    color: colors.textMuted,
    lineHeight: 20,
  },
});

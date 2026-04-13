import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../theme';

type AppButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
};

export function AppButton({ title, onPress, loading, variant = 'primary' }: AppButtonProps) {
  const variantStyle = buttonVariants[variant];

  return (
    <Pressable style={[styles.button, variantStyle.button]} onPress={onPress} disabled={loading}>
      {loading ? (
        <ActivityIndicator color={variantStyle.text.color} />
      ) : (
        <Text style={[styles.text, variantStyle.text]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
  },
});

const buttonVariants = {
  primary: {
    button: {
      backgroundColor: colors.primary,
    },
    text: {
      color: '#FFF',
    },
  },
  secondary: {
    button: {
      backgroundColor: colors.secondary,
    },
    text: {
      color: '#FFF',
    },
  },
  ghost: {
    button: {
      backgroundColor: colors.secondaryLight,
    },
    text: {
      color: colors.secondary,
    },
  },
  danger: {
    button: {
      backgroundColor: '#FFECEC',
    },
    text: {
      color: colors.danger,
    },
  },
} as const;

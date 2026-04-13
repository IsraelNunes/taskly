import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, spacing } from '../theme';

type AppInputProps = TextInputProps & {
  label: string;
  error?: string;
};

export function AppInput({ label, error, ...props }: AppInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        style={[styles.input, error ? styles.inputError : undefined, props.style]}
        placeholderTextColor={colors.textMuted}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 15,
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
  },
});

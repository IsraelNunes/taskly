import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing } from '../theme';

export function HomeScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.greeting}>Olá, {user?.nome ?? 'visitante'}! 👋</Text>
        <Text style={styles.subtitle}>
          {user?.perfil === 'PROFISSIONAL'
            ? 'Gerencie seu perfil e acompanhe seus serviços.'
            : user?.perfil === 'CLIENTE'
              ? 'Encontre os melhores profissionais para o seu serviço.'
              : 'Bem-vindo ao painel Taskly.'}
        </Text>
      </View>

      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>🚧</Text>
        <Text style={styles.placeholderLabel}>Em desenvolvimento</Text>
        <Text style={styles.placeholderDesc}>
          O feed de serviços estará disponível na próxima fase do projeto.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
    lineHeight: 22,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  placeholderText: {
    fontSize: 48,
  },
  placeholderLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  placeholderDesc: {
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    lineHeight: 22,
  },
});

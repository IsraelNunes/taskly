import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { colors, spacing } from '../theme';

export function PublicAccountScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Acesse sua conta Taskly</Text>
        <Text style={styles.subtitle}>
          Entre para comentar notícias, gerenciar conteúdos e usar recursos por perfil.
        </Text>

        <View style={styles.actions}>
          <AppButton title="Entrar" onPress={() => navigation.navigate('Login')} />
          <AppButton title="Criar conta" variant="ghost" onPress={() => navigation.navigate('Cadastro')} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
    lineHeight: 22,
  },
  actions: {
    gap: spacing.sm,
  },
});

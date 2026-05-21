import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing } from '../theme';

type RoleOption = 'CLIENTE' | 'PROFISSIONAL';

const ROLE_OPTIONS: { value: RoleOption; label: string; description: string; icon: string }[] = [
  {
    value: 'CLIENTE',
    label: 'Sou Cliente',
    description: 'Quero contratar serviços',
    icon: '🙋',
  },
  {
    value: 'PROFISSIONAL',
    label: 'Sou Profissional',
    description: 'Quero oferecer meus serviços',
    icon: '🔧',
  },
];

export function RegisterScreen({ navigation }: any) {
  const { signUp } = useAuth();
  const [nome, setNome] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [perfil, setPerfil] = useState<RoleOption>('CLIENTE');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      await signUp({ nome, username, password, perfil });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Crie sua conta</Text>
        <Text style={styles.subtitle}>Como você quer usar o Taskly?</Text>
      </View>

      <View style={styles.roleRow}>
        {ROLE_OPTIONS.map((option) => {
          const active = perfil === option.value;
          return (
            <Pressable
              key={option.value}
              style={[styles.roleCard, active && styles.roleCardActive]}
              onPress={() => setPerfil(option.value)}
            >
              <Text style={styles.roleIcon}>{option.icon}</Text>
              <Text style={[styles.roleLabel, active && styles.roleLabelActive]}>
                {option.label}
              </Text>
              <Text style={[styles.roleDesc, active && styles.roleDescActive]}>
                {option.description}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.form}>
        <AppInput label="Nome completo" value={nome} onChangeText={setNome} placeholder="Seu nome" />
        <AppInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          placeholder="seu.username"
          autoCapitalize="none"
        />
        <AppInput
          label="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Mínimo 6 caracteres"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton title="Cadastrar" onPress={handleSubmit} loading={loading} />
        <AppButton title="Já tenho conta" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    gap: spacing.lg,
    backgroundColor: colors.background,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
  },
  roleRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  roleCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
  },
  roleCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFF3EE',
  },
  roleIcon: {
    fontSize: 28,
  },
  roleLabel: {
    fontWeight: '700',
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  roleLabelActive: {
    color: colors.primary,
  },
  roleDesc: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  roleDescActive: {
    color: colors.primary,
  },
  form: {
    gap: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
});

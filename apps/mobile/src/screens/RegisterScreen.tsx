import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
    description: 'Quero oferecer serviços',
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
      style={styles.wrapper}
    >
      <ScrollView bounces={false} contentContainerStyle={styles.scroll}>
        <LinearGradient colors={[colors.secondary, '#094F55']} style={styles.header}>
          <Text style={styles.headerTitle}>Crie sua conta</Text>
          <Text style={styles.headerSubtitle}>Como você quer usar o Taskly?</Text>

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
        </LinearGradient>

        <View style={styles.card}>
          <AppInput
            label="Nome completo"
            value={nome}
            onChangeText={setNome}
            placeholder="Seu nome"
          />
          <AppInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="seu.username"
            autoCapitalize="none"
            autoCorrect={false}
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

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <AppButton title="Já tenho conta" variant="ghost" onPress={() => navigation.goBack()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  scroll: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginTop: -spacing.xs,
  },
  roleRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  roleCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  roleCardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255,107,61,0.15)',
  },
  roleIcon: {
    fontSize: 28,
  },
  roleLabel: {
    fontWeight: '700',
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  roleLabelActive: {
    color: '#FFF',
  },
  roleDesc: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  roleDescActive: {
    color: 'rgba(255,255,255,0.9)',
  },
  card: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.xl,
    gap: spacing.md,
    marginTop: -24,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    textAlign: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
});

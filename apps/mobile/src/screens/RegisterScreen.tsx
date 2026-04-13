import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { useAuth } from '../hooks/useAuth';
import { AuthStackParamList } from '../types/navigation';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Cadastro'>;

export function RegisterScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [nome, setNome] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      await signUp({ nome, username, password });
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
        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>Seu perfil inicial será LEITOR, pronto para o Taskly.</Text>
      </View>

      <View style={styles.form}>
        <AppInput label="Nome" value={nome} onChangeText={setNome} placeholder="Seu nome" />
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
    gap: spacing.xl,
    backgroundColor: colors.background,
  },
  header: {
    gap: spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
    lineHeight: 21,
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

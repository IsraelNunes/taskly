import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/user.service';
import { colors, spacing } from '../theme';

export function EditClientProfileScreen({ navigation }: any) {
  const { user, token, refreshUser } = useAuth();
  const [nome, setNome] = useState(user?.nome ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [telefone, setTelefone] = useState(user?.telefone ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!token) return;

    setError(null);
    setLoading(true);

    try {
      await userService.updateMe(
        {
          nome,
          email: email || undefined,
          telefone: telefone || undefined,
          ...(password ? { password } : {}),
        },
        token,
      );
      await refreshUser();
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.wrapper}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Editar perfil</Text>

        <AppInput label="Nome completo" value={nome} onChangeText={setNome} placeholder="Seu nome" />
        <AppInput
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          placeholder="seu@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <AppInput
          label="Telefone"
          value={telefone}
          onChangeText={setTelefone}
          placeholder="(00) 00000-0000"
          keyboardType="phone-pad"
        />
        <AppInput
          label="Nova senha (opcional)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Deixe vazio para manter"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <AppButton title="Salvar" onPress={() => void save()} loading={loading} />
        <AppButton title="Cancelar" variant="ghost" onPress={() => navigation.goBack()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
});

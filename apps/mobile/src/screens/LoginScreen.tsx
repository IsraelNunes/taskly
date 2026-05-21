import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing } from '../theme';

export function LoginScreen({ navigation }: any) {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await signIn({ username, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível realizar o login.');
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
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetter}>T</Text>
          </View>
          <Text style={styles.headerTitle}>Bem-vindo de volta</Text>
          <Text style={styles.headerSubtitle}>Entre para acessar seus serviços</Text>
        </LinearGradient>

        <View style={styles.card}>
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
            placeholder="Sua senha"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <AppButton title="Entrar" onPress={handleSubmit} loading={loading} />

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <AppButton
            title="Criar conta grátis"
            variant="ghost"
            onPress={() => navigation.navigate('Cadastro')}
          />
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
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    gap: 10,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  logoLetter: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '900',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },
  card: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.xl,
    paddingTop: spacing.xl,
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

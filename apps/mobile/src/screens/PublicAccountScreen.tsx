import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { colors, spacing } from '../theme';

export function PublicAccountScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.secondary, '#094F55']} style={styles.hero}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoLetter}>T</Text>
        </View>
        <Text style={styles.heroTitle}>Taskly</Text>
        <Text style={styles.heroTagline}>
          Encontre profissionais qualificados{'\n'}para qualquer serviço
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.contentTitle}>Bem-vindo!</Text>
        <Text style={styles.contentSubtitle}>
          Entre ou crie sua conta para acessar profissionais verificados perto de você.
        </Text>

        <View style={styles.actions}>
          <AppButton title="Entrar na conta" onPress={() => navigation.navigate('Login')} />
          <AppButton
            title="Criar conta grátis"
            variant="ghost"
            onPress={() => navigation.navigate('Cadastro')}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: spacing.xl,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  logoLetter: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '900',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  heroTagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.xl,
    paddingBottom: spacing.xl + 8,
    gap: spacing.md,
    marginTop: -24,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  contentSubtitle: {
    color: colors.textMuted,
    lineHeight: 22,
    fontSize: 15,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});

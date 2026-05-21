import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing } from '../theme';

const CATEGORIES = [
  { icon: '⚡', label: 'Elétrica' },
  { icon: '🔧', label: 'Hidráulica' },
  { icon: '🪚', label: 'Marcenaria' },
  { icon: '🎨', label: 'Pintura' },
  { icon: '🧹', label: 'Limpeza' },
  { icon: '🌿', label: 'Jardinagem' },
];

export function HomeScreen() {
  const { user } = useAuth();
  const isProfissional = user?.perfil === 'PROFISSIONAL';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={[colors.secondary, '#0A6870']} style={styles.heroBand}>
        <Text style={styles.greeting}>
          Olá, {user?.nome?.split(' ')[0] ?? 'visitante'} 👋
        </Text>
        <Text style={styles.heroSubtitle}>
          {isProfissional
            ? 'Gerencie seu perfil e atraia novos clientes.'
            : 'Qual serviço você precisa hoje?'}
        </Text>
      </LinearGradient>

      <View style={styles.body}>
        <Text style={styles.sectionTitle}>Categorias</Text>
        <View style={styles.categoriesGrid}>
          {CATEGORIES.map((cat) => (
            <View key={cat.label} style={styles.categoryCard}>
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderIcon}>🚧</Text>
          <Text style={styles.placeholderTitle}>Em desenvolvimento</Text>
          <Text style={styles.placeholderDesc}>
            {isProfissional
              ? 'As solicitações de serviço estarão disponíveis em breve.'
              : 'O feed de profissionais estará disponível na próxima fase.'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroBand: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl + 8,
    gap: spacing.xs,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  body: {
    marginTop: -16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.lg,
    minHeight: 400,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flexGrow: 1,
  },
  categoryIcon: {
    fontSize: 26,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  placeholderCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  placeholderIcon: {
    fontSize: 40,
  },
  placeholderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  placeholderDesc: {
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 14,
  },
});

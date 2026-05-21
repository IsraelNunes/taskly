import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { colors, spacing } from '../theme';

export function AdminPanelScreen() {
  const navigation = useNavigation<any>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Painel Admin</Text>
        <Text style={styles.subtitle}>
          Gestão de usuários, perfis, categorias de serviço, UFs e cidades.
        </Text>
      </View>

      <View style={styles.actions}>
        <AppButton title="Gerenciar Usuários" onPress={() => navigation.navigate('AdminUsers')} />
        <AppButton title="Gerenciar Categorias" onPress={() => navigation.navigate('AdminCategories')} />
        <AppButton title="Gerenciar Perfis" onPress={() => navigation.navigate('AdminProfiles')} />
        <AppButton title="Gerenciar UFs" onPress={() => navigation.navigate('AdminUfs')} />
        <AppButton title="Gerenciar Cidades" onPress={() => navigation.navigate('AdminCities')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    lineHeight: 21,
  },
  actions: {
    gap: spacing.sm,
  },
});

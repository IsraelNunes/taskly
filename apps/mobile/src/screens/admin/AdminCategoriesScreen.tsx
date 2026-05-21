import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { categoryService } from '../../services/category.service';
import { ServiceCategory } from '../../types/profiles';
import { colors, spacing } from '../../theme';

export function AdminCategoriesScreen() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      categoryService
        .list()
        .then(setCategories)
        .catch(() => null)
        .finally(() => setLoading(false));
    }, []),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={categories}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <Text style={styles.title}>Categorias de Serviço</Text>
      }
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.nome}>{item.nome}</Text>
          <Text style={styles.slug}>{item.slug}</Text>
        </View>
      )}
      ListEmptyComponent={
        <Text style={styles.empty}>Nenhuma categoria cadastrada.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  row: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nome: {
    fontWeight: '700',
    color: colors.text,
    fontSize: 15,
  },
  slug: {
    color: colors.textMuted,
    fontSize: 12,
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});

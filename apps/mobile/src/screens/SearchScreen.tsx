import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AppInput } from '../components/AppInput';
import { EmptyState } from '../components/EmptyState';
import { categoryService } from '../services/category.service';
import { professionalProfileService } from '../services/professional-profile.service';
import { ProfessionalSummary, ServiceCategory } from '../types/profiles';
import { colors, spacing } from '../theme';

export function SearchScreen({ navigation }: any) {
  const [professionals, setProfessionals] = useState<ProfessionalSummary[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      void Promise.all([
        professionalProfileService.list(),
        categoryService.list(),
      ]).then(([profs, cats]) => {
        setProfessionals(profs);
        setCategories(cats);
      }).finally(() => setLoading(false));
    }, []),
  );

  const filtered = professionals.filter((p) => {
    const matchName = !search || p.nome.toLowerCase().includes(search.toLowerCase());
    return matchName;
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.secondary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <AppInput
          label=""
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por nome..."
          autoCorrect={false}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <Pressable
          style={[styles.chip, !selectedCategory && styles.chipActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.chipText, !selectedCategory && styles.chipTextActive]}>Todos</Text>
        </Pressable>
        {categories.map((cat) => (
          <Pressable
            key={cat.id}
            style={[styles.chip, selectedCategory === cat.id && styles.chipActive]}
            onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
          >
            <Text
              style={[
                styles.chipText,
                selectedCategory === cat.id && styles.chipTextActive,
              ]}
            >
              {cat.nome}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              navigation.navigate('ProfessionalPublicProfile', { userId: item.userId })
            }
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.nome[0].toUpperCase()}</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{item.nome}</Text>
              <Text style={styles.cardCity}>{item.cidade ?? 'Cidade não informada'}</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingStar}>★</Text>
                <Text style={styles.ratingText}>
                  {parseFloat(item.avaliacaoMedia ?? '0').toFixed(1)}
                </Text>
              </View>
            </View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            title="Nenhum profissional encontrado"
            description="Tente buscar com outros termos."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchBar: { padding: spacing.md, paddingBottom: 0 },
  chips: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
  },
  chipActive: { borderColor: colors.secondary, backgroundColor: colors.secondaryLight },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  chipTextActive: { color: colors.secondary },
  list: { padding: spacing.md, gap: spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  cardInfo: { flex: 1, gap: 3 },
  cardName: { fontSize: 15, fontWeight: '700', color: colors.text },
  cardCity: { fontSize: 12, color: colors.textMuted },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingStar: { color: '#F5A623', fontSize: 13 },
  ratingText: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  arrow: { fontSize: 22, color: colors.textMuted },
});

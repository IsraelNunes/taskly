import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { EmptyState } from '../components/EmptyState';
import { LoadingView } from '../components/LoadingView';
import { NewsCard } from '../components/NewsCard';
import { newsService } from '../services/news.service';
import { colors, spacing } from '../theme';
import { AppStackParamList } from '../types/navigation';
import { NewsSummary } from '../types/news';

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [items, setItems] = useState<NewsSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }

    try {
      const data = await newsService.list();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar notícias.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  if (loading) {
    return <LoadingView label="Carregando notícias..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notícias Taskly</Text>
        <Text style={styles.subtitle}>Atualizações, conteúdos e novidades do projeto.</Text>
        <AppButton
          title="Nova notícia"
          onPress={() => navigation.navigate('NewsForm', {})}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <NewsCard
            item={item}
            onPress={() => navigation.navigate('NewsDetail', { id: item.id })}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void loadData(false);
            }}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="Sem notícias publicadas"
            description="Crie uma notícia para começar o feed da disciplina."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  header: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    fontSize: 23,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
  },
  listContent: {
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
});

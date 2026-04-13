import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { LoadingView } from '../components/LoadingView';
import { useAuth } from '../hooks/useAuth';
import { newsService } from '../services/news.service';
import { colors, spacing } from '../theme';
import { AppStackParamList } from '../types/navigation';
import { NewsDetail } from '../types/news';

type Props = NativeStackScreenProps<AppStackParamList, 'NewsDetail'>;

export function NewsDetailScreen({ route, navigation }: Props) {
  const { token, user } = useAuth();
  const [item, setItem] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canEdit = user?.id === item?.autorId || user?.perfil === 'SUPERADMIN';

  const loadDetail = useCallback(async () => {
    setLoading(true);

    try {
      const data = await newsService.detail(route.params.id);
      setItem(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar a notícia.');
    } finally {
      setLoading(false);
    }
  }, [route.params.id]);

  useFocusEffect(
    useCallback(() => {
      void loadDetail();
    }, [loadDetail]),
  );

  const handleDelete = () => {
    if (!token || !item) {
      return;
    }

    Alert.alert('Excluir notícia', 'Essa ação não pode ser desfeita. Confirmar exclusão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await newsService.remove(item.id, token);
            navigation.goBack();
          } catch (err) {
            Alert.alert('Erro', err instanceof Error ? err.message : 'Não foi possível excluir.');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return <LoadingView label="Abrindo notícia..." />;
  }

  if (!item) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.error}>{error ?? 'Notícia não encontrada.'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {item.imagem ? <Image source={{ uri: item.imagem }} style={styles.image} /> : null}
      <Text style={styles.title}>{item.titulo}</Text>
      <Text style={styles.meta}>
        Por {item.autorNome} • {item.status}
      </Text>
      <Text style={styles.summary}>{item.resumo}</Text>
      <Text style={styles.body}>{item.texto}</Text>

      {token && canEdit ? (
        <View style={styles.actions}>
          <AppButton title="Editar" onPress={() => navigation.navigate('NewsForm', { id: item.id })} />
          <AppButton title="Excluir" variant="danger" onPress={handleDelete} loading={deleting} />
        </View>
      ) : null}
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
  image: {
    width: '100%',
    height: 220,
    borderRadius: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  meta: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  summary: {
    color: colors.secondary,
    fontWeight: '700',
    lineHeight: 22,
  },
  body: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 24,
  },
  actions: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  error: {
    color: colors.danger,
    textAlign: 'center',
  },
});

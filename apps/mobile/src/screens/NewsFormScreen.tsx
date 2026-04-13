import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { LoadingView } from '../components/LoadingView';
import { useAuth } from '../hooks/useAuth';
import { newsService } from '../services/news.service';
import { colors, spacing } from '../theme';
import { AppStackParamList } from '../types/navigation';
import { NewsStatus } from '../types/news';

type Props = NativeStackScreenProps<AppStackParamList, 'NewsForm'>;

export function NewsFormScreen({ navigation, route }: Props) {
  const { token } = useAuth();
  const [titulo, setTitulo] = useState('');
  const [imagem, setImagem] = useState('');
  const [resumo, setResumo] = useState('');
  const [texto, setTexto] = useState('');
  const [status, setStatus] = useState<NewsStatus>('PUBLICADO');
  const [loading, setLoading] = useState(!!route.params?.id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = useMemo(() => Boolean(route.params?.id), [route.params?.id]);

  useEffect(() => {
    const fetchIfNeeded = async () => {
      if (!route.params?.id) {
        return;
      }

      try {
        const data = await newsService.detail(route.params.id);
        setTitulo(data.titulo);
        setImagem(data.imagem ?? '');
        setResumo(data.resumo);
        setTexto(data.texto);
        setStatus(data.status);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Não foi possível carregar notícia.');
      } finally {
        setLoading(false);
      }
    };

    void fetchIfNeeded();
  }, [route.params?.id]);

  const handleSubmit = async () => {
    if (!token) {
      setError('Faça login para salvar notícias.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        titulo,
        imagem: imagem.trim() || undefined,
        resumo,
        texto,
        status,
      };

      if (route.params?.id) {
        const updated = await newsService.update(route.params.id, payload, token);
        navigation.replace('NewsDetail', { id: updated.id });
      } else {
        const created = await newsService.create(payload, token);
        navigation.replace('NewsDetail', { id: created.id });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar a notícia.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingView label="Preparando formulário..." />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{isEdit ? 'Editar notícia' : 'Nova notícia'}</Text>

      <View style={styles.form}>
        <AppInput label="Título" value={titulo} onChangeText={setTitulo} placeholder="Título da notícia" />
        <AppInput
          label="Imagem (URL opcional)"
          value={imagem}
          onChangeText={setImagem}
          placeholder="https://..."
          autoCapitalize="none"
        />
        <AppInput
          label="Resumo"
          value={resumo}
          onChangeText={setResumo}
          placeholder="Resumo curto"
          multiline
          style={styles.multiline}
        />
        <AppInput
          label="Texto"
          value={texto}
          onChangeText={setTexto}
          placeholder="Conteúdo completo da notícia"
          multiline
          style={styles.largeMultiline}
        />

        <Text style={styles.statusLabel}>Status</Text>
        <View style={styles.statusRow}>
          <AppButton
            title="PUBLICADO"
            onPress={() => setStatus('PUBLICADO')}
            variant={status === 'PUBLICADO' ? 'secondary' : 'ghost'}
          />
          <AppButton
            title="RASCUNHO"
            onPress={() => setStatus('RASCUNHO')}
            variant={status === 'RASCUNHO' ? 'secondary' : 'ghost'}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <AppButton title={isEdit ? 'Salvar alterações' : 'Publicar notícia'} onPress={handleSubmit} loading={submitting} />
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
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
  },
  form: {
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  largeMultiline: {
    minHeight: 170,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  error: {
    color: colors.danger,
  },
});

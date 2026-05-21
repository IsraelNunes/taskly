import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { EmptyState } from '../../components/EmptyState';
import { useAuth } from '../../hooks/useAuth';
import { locationService } from '../../services/location.service';
import { colors, spacing } from '../../theme';
import { Uf } from '../../types/admin';

export function AdminUfsScreen() {
  const { token } = useAuth();
  const [items, setItems] = useState<Uf[]>([]);
  const [sigla, setSigla] = useState('');
  const [nome, setNome] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await locationService.listUfs();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar UFs.');
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const submit = async () => {
    if (!token) return;

    try {
      if (editingId) {
        await locationService.updateUf(editingId, { sigla, nome }, token);
      } else {
        await locationService.createUf({ sigla, nome }, token);
      }
      setSigla('');
      setNome('');
      setEditingId(null);
      setError(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar UF.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CRUD de UFs</Text>

      <View style={styles.form}>
        <AppInput label="Sigla" value={sigla} onChangeText={setSigla} placeholder="SP" autoCapitalize="characters" />
        <AppInput label="Nome" value={nome} onChangeText={setNome} placeholder="São Paulo" />
        <AppButton title={editingId ? 'Salvar UF' : 'Criar UF'} onPress={() => void submit()} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item.sigla} - {item.nome}</Text>
            <View style={styles.row}>
              <AppButton title="Editar" variant="ghost" onPress={() => { setEditingId(item.id); setSigla(item.sigla); setNome(item.nome); }} />
              <AppButton title="Excluir" variant="danger" onPress={() => token && void locationService.removeUf(item.id, token).then(load).catch((err) => setError(err instanceof Error ? err.message : 'Erro ao excluir UF.'))} />
            </View>
          </View>
        )}
        ListEmptyComponent={<EmptyState title="Sem UFs" description="Cadastre UFs para cidades." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md, gap: spacing.md },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  form: { gap: spacing.sm, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  list: { gap: spacing.sm, paddingBottom: spacing.xl },
  item: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.md, gap: spacing.sm },
  itemTitle: { color: colors.text, fontWeight: '700' },
  row: { gap: spacing.sm },
  error: { color: colors.danger },
});

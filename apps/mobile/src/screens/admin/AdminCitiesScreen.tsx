import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { EmptyState } from '../../components/EmptyState';
import { useAuth } from '../../hooks/useAuth';
import { locationService } from '../../services/location.service';
import { colors, spacing } from '../../theme';
import { City, Uf } from '../../types/admin';

export function AdminCitiesScreen() {
  const { token } = useAuth();
  const [cities, setCities] = useState<City[]>([]);
  const [ufs, setUfs] = useState<Uf[]>([]);
  const [nome, setNome] = useState('');
  const [ufId, setUfId] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [ufsData, citiesData] = await Promise.all([locationService.listUfs(), locationService.listCities()]);
      setUfs(ufsData);
      setCities(citiesData);
      if (!ufId && ufsData[0]) {
        setUfId(ufsData[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar cidades.');
    }
  }, [ufId]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const submit = async () => {
    if (!token || !ufId) return;

    try {
      if (editingId) {
        await locationService.updateCity(editingId, { nome, ufId }, token);
      } else {
        await locationService.createCity({ nome, ufId }, token);
      }
      setNome('');
      setEditingId(null);
      setError(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar cidade.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CRUD de Cidades</Text>

      <View style={styles.form}>
        <AppInput label="Nome da cidade" value={nome} onChangeText={setNome} placeholder="Campinas" />

        <Text style={styles.subtitle}>Selecione a UF</Text>
        <FlatList
          horizontal
          data={ufs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.ufList}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.ufChip, ufId === item.id ? styles.ufChipActive : undefined]}
              onPress={() => setUfId(item.id)}
            >
              <Text style={[styles.ufText, ufId === item.id ? styles.ufTextActive : undefined]}>{item.sigla}</Text>
            </Pressable>
          )}
        />

        <AppButton title={editingId ? 'Salvar cidade' : 'Criar cidade'} onPress={() => void submit()} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={cities}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item.nome} ({item.ufSigla})</Text>
            <View style={styles.row}>
              <AppButton title="Editar" variant="ghost" onPress={() => { setEditingId(item.id); setNome(item.nome); setUfId(item.ufId); }} />
              <AppButton title="Excluir" variant="danger" onPress={() => token && void locationService.removeCity(item.id, token).then(load).catch((err) => setError(err instanceof Error ? err.message : 'Erro ao excluir cidade.'))} />
            </View>
          </View>
        )}
        ListEmptyComponent={<EmptyState title="Sem cidades" description="Cadastre cidades vinculadas a uma UF." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md, gap: spacing.md },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { color: colors.text, fontWeight: '700' },
  form: { gap: spacing.sm, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  ufList: { gap: spacing.sm },
  ufChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10, backgroundColor: colors.surface },
  ufChipActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  ufText: { color: colors.text, fontWeight: '700' },
  ufTextActive: { color: '#FFF' },
  list: { gap: spacing.sm, paddingBottom: spacing.xl },
  item: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.md, gap: spacing.sm },
  itemTitle: { color: colors.text, fontWeight: '700' },
  row: { gap: spacing.sm },
  error: { color: colors.danger },
});

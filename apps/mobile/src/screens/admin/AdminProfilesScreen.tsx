import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { EmptyState } from '../../components/EmptyState';
import { useAuth } from '../../hooks/useAuth';
import { profileService } from '../../services/profile.service';
import { colors, spacing } from '../../theme';
import { Profile } from '../../types/admin';

export function AdminProfilesScreen() {
  const { token } = useAuth();
  const [items, setItems] = useState<Profile[]>([]);
  const [descricao, setDescricao] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await profileService.list();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar perfis.');
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const submit = async () => {
    if (!token) return;

    try {
      if (editingId) {
        await profileService.update(editingId, descricao, token);
      } else {
        await profileService.create(descricao, token);
      }
      setDescricao('');
      setEditingId(null);
      setError(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar perfil.');
    }
  };

  const remove = async (id: string) => {
    if (!token) return;

    try {
      await profileService.remove(id, token);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir perfil.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CRUD de Perfis</Text>

      <View style={styles.form}>
        <AppInput label="Descrição" value={descricao} onChangeText={setDescricao} placeholder="CLIENTE, PROFISSIONAL, ADMIN..." autoCapitalize="characters" />
        <AppButton title={editingId ? 'Salvar perfil' : 'Criar perfil'} onPress={() => void submit()} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item.descricao}</Text>
            <View style={styles.row}>
              <AppButton title="Editar" variant="ghost" onPress={() => { setEditingId(item.id); setDescricao(item.descricao); }} />
              <AppButton title="Excluir" variant="danger" onPress={() => void remove(item.id)} />
            </View>
          </View>
        )}
        ListEmptyComponent={<EmptyState title="Sem perfis" description="Cadastre perfis para RBAC." />}
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

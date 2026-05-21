import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { EmptyState } from '../../components/EmptyState';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/user.service';
import { colors, spacing } from '../../theme';
import { AdminUser } from '../../types/admin';

export function AdminUsersScreen() {
  const { token } = useAuth();
  const [items, setItems] = useState<AdminUser[]>([]);
  const [nome, setNome] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123456');
  const [perfil, setPerfil] = useState('CLIENTE');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;

    try {
      const data = await userService.adminList(token);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários.');
    }
  }, [token]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const submit = async () => {
    if (!token) return;

    try {
      if (editingId) {
        await userService.adminUpdate(editingId, { nome, username, password, perfil }, token);
      } else {
        await userService.adminCreate({ nome, username, password, perfil }, token);
      }

      setNome('');
      setUsername('');
      setPassword('123456');
      setPerfil('CLIENTE');
      setEditingId(null);
      setError(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar usuário.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CRUD de Usuários</Text>

      <View style={styles.form}>
        <AppInput label="Nome" value={nome} onChangeText={setNome} placeholder="Nome completo" />
        <AppInput label="Username" value={username} onChangeText={setUsername} autoCapitalize="none" placeholder="usuario" />
        <AppInput label="Senha" value={password} onChangeText={setPassword} secureTextEntry placeholder="123456" />
        <AppInput label="Perfil" value={perfil} onChangeText={setPerfil} placeholder="CLIENTE/PROFISSIONAL/ADMIN" autoCapitalize="characters" />
        <AppButton title={editingId ? 'Salvar usuário' : 'Criar usuário'} onPress={() => void submit()} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item.nome}</Text>
            <Text style={styles.meta}>@{item.username} • {item.perfil}</Text>
            <View style={styles.row}>
              <AppButton title="Editar" variant="ghost" onPress={() => { setEditingId(item.id); setNome(item.nome); setUsername(item.username); setPerfil(item.perfil); setPassword(''); }} />
              <AppButton title="Excluir" variant="danger" onPress={() => token && void userService.adminRemove(item.id, token).then(load).catch((err) => setError(err instanceof Error ? err.message : 'Erro ao excluir usuário.'))} />
            </View>
          </View>
        )}
        ListEmptyComponent={<EmptyState title="Sem usuários" description="Cadastre usuários por perfil para testes." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md, gap: spacing.md },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  form: { gap: spacing.sm, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  list: { gap: spacing.sm, paddingBottom: spacing.xl },
  item: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.md, gap: spacing.xs },
  itemTitle: { color: colors.text, fontWeight: '700' },
  meta: { color: colors.textMuted },
  row: { gap: spacing.sm, marginTop: spacing.sm },
  error: { color: colors.danger },
});

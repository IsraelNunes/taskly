import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { useAuth } from '../hooks/useAuth';
import { API_URL } from '../services/http';
import { colors, spacing } from '../theme';
import { AppStackParamList } from '../types/navigation';

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Meu perfil</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Nome</Text>
          <Text style={styles.value}>{user?.nome ?? '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Username</Text>
          <Text style={styles.value}>{user?.username ?? '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Perfil</Text>
          <Text style={styles.value}>{user?.perfil ?? '-'}</Text>
        </View>
      </View>

      <View style={styles.cardMuted}>
        <Text style={styles.metaTitle}>API em uso</Text>
        <Text style={styles.metaValue}>{API_URL}</Text>
      </View>

      <View style={styles.actions}>
        <AppButton
          title="Criar notícia"
          onPress={() => navigation.navigate('NewsForm', {})}
        />
        <AppButton title="Sair" variant="danger" onPress={() => void signOut()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.md,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardMuted: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.secondaryLight,
    padding: spacing.md,
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  row: {
    gap: spacing.xs,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
  },
  value: {
    color: colors.text,
    fontWeight: '700',
  },
  metaTitle: {
    color: colors.secondary,
    fontWeight: '700',
  },
  metaValue: {
    color: colors.text,
  },
  actions: {
    gap: spacing.sm,
  },
});

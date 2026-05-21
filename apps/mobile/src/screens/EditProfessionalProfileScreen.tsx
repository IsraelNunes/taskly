import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { useAuth } from '../hooks/useAuth';
import { categoryService } from '../services/category.service';
import { professionalProfileService } from '../services/professional-profile.service';
import { userService } from '../services/user.service';
import { ProfessionalProfile, ServiceCategory } from '../types/profiles';
import { colors, spacing } from '../theme';

export function EditProfessionalProfileScreen({ navigation }: any) {
  const { user, token, refreshUser } = useAuth();

  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [nome, setNome] = useState(user?.nome ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [telefone, setTelefone] = useState(user?.telefone ?? '');
  const [bio, setBio] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    Promise.all([professionalProfileService.getMe(token), categoryService.list()])
      .then(([prof, cats]) => {
        setProfile(prof);
        setCategories(cats);
        setBio(prof?.bio ?? '');
        setSelectedCategories(prof?.categories?.map((c) => c.id) ?? []);
      })
      .catch(() => null)
      .finally(() => setLoadingData(false));
  }, [token]);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const save = async () => {
    if (!token) return;

    setError(null);
    setLoading(true);

    try {
      await Promise.all([
        userService.updateMe(
          {
            nome,
            email: email || undefined,
            telefone: telefone || undefined,
            ...(password ? { password } : {}),
          },
          token,
        ),
        professionalProfileService.updateMe(
          {
            bio: bio || undefined,
            categoryIds: selectedCategories,
          },
          token,
        ),
      ]);

      await refreshUser();
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.wrapper}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Editar perfil profissional</Text>

        <AppInput label="Nome completo" value={nome} onChangeText={setNome} placeholder="Seu nome" />
        <AppInput
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          placeholder="seu@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <AppInput
          label="Telefone"
          value={telefone}
          onChangeText={setTelefone}
          placeholder="(00) 00000-0000"
          keyboardType="phone-pad"
        />
        <AppInput
          label="Bio"
          value={bio}
          onChangeText={setBio}
          placeholder="Fale sobre você e seus serviços..."
          multiline
          numberOfLines={4}
        />

        <Text style={styles.sectionLabel}>Especialidades</Text>
        <View style={styles.tagsRow}>
          {categories.map((cat) => {
            const active = selectedCategories.includes(cat.id);
            return (
              <Pressable
                key={cat.id}
                style={[styles.tag, active && styles.tagActive]}
                onPress={() => toggleCategory(cat.id)}
              >
                <Text style={[styles.tagText, active && styles.tagTextActive]}>{cat.nome}</Text>
              </Pressable>
            );
          })}
        </View>

        <AppInput
          label="Nova senha (opcional)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Deixe vazio para manter"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <AppButton title="Salvar" onPress={() => void save()} loading={loading} />
        <AppButton title="Cancelar" variant="ghost" onPress={() => navigation.goBack()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontWeight: '700',
    color: colors.text,
    fontSize: 14,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
  },
  tagActive: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondaryLight,
  },
  tagText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  tagTextActive: {
    color: colors.secondary,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
});

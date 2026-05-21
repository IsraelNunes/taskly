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
          { bio: bio || undefined, categoryIds: selectedCategories },
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
        <ActivityIndicator color={colors.secondary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.wrapper}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Dados pessoais</Text>
          <View style={styles.card}>
            <AppInput
              label="Nome completo"
              value={nome}
              onChangeText={setNome}
              placeholder="Seu nome"
            />
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
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Perfil profissional</Text>
          <View style={styles.card}>
            <AppInput
              label="Bio"
              value={bio}
              onChangeText={setBio}
              placeholder="Fale sobre você, sua experiência e serviços..."
              multiline
              numberOfLines={4}
              style={styles.bioInput}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Especialidades</Text>
          <View style={styles.chipsCard}>
            {categories.map((cat) => {
              const active = selectedCategories.includes(cat.id);
              return (
                <Pressable
                  key={cat.id}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => toggleCategory(cat.id)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {cat.nome}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Segurança</Text>
          <View style={styles.card}>
            <AppInput
              label="Nova senha (opcional)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Deixe vazio para manter a senha atual"
            />
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.actions}>
          <AppButton title="Salvar alterações" onPress={() => void save()} loading={loading} />
          <AppButton title="Cancelar" variant="ghost" onPress={() => navigation.goBack()} />
        </View>
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
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  bioInput: {
    minHeight: 96,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  chipsCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: colors.background,
  },
  chipActive: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondaryLight,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.secondary,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.sm,
  },
});

import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { useAuth } from '../hooks/useAuth';
import { clientProfileService } from '../services/client-profile.service';
import { professionalProfileService } from '../services/professional-profile.service';
import { ClientProfile, ProfessionalProfile } from '../types/profiles';
import { colors, spacing } from '../theme';

export function ProfileScreen({ navigation }: any) {
  const { user, token, signOut } = useAuth();

  if (!user) {
    return null;
  }

  if (user.perfil === 'CLIENTE') {
    return <ClientProfileView navigation={navigation} />;
  }

  if (user.perfil === 'PROFISSIONAL') {
    return <ProfessionalProfileView navigation={navigation} />;
  }

  return <AdminProfileView navigation={navigation} />;
}

function ClientProfileView({ navigation }: any) {
  const { user, token, signOut } = useAuth();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    clientProfileService
      .getMe(token)
      .then(setProfile)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarInitial}>{user?.nome?.[0]?.toUpperCase() ?? '?'}</Text>
      </View>

      <Text style={styles.name}>{user?.nome}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Cliente</Text>
      </View>

      <View style={styles.card}>
        <InfoRow label="Username" value={`@${user?.username}`} />
        <InfoRow label="E-mail" value={user?.email ?? '—'} />
        <InfoRow label="Telefone" value={user?.telefone ?? '—'} />
        <InfoRow label="Cidade" value={user?.cidade ?? '—'} />
      </View>

      <AppButton
        title="Editar perfil"
        onPress={() => navigation.navigate('EditClientProfile')}
      />
      <AppButton title="Sair" variant="danger" onPress={() => void signOut()} />
    </ScrollView>
  );
}

function ProfessionalProfileView({ navigation }: any) {
  const { user, token, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    professionalProfileService
      .getMe(token)
      .then(setProfile)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const rating = parseFloat(profile?.avaliacaoMedia ?? '0');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarInitial}>{user?.nome?.[0]?.toUpperCase() ?? '?'}</Text>
      </View>

      <Text style={styles.name}>{user?.nome}</Text>
      <View style={[styles.badge, styles.badgeProfessional]}>
        <Text style={styles.badgeText}>Profissional</Text>
      </View>

      {profile?.isVerified ? (
        <View style={[styles.badge, styles.badgeVerified]}>
          <Text style={styles.badgeText}>✓ Verificado</Text>
        </View>
      ) : null}

      <View style={styles.ratingRow}>
        <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
        <Text style={styles.ratingStar}>★</Text>
        <Text style={styles.ratingCount}>({profile?.totalAvaliacoes ?? 0} avaliações)</Text>
      </View>

      <View style={styles.card}>
        <InfoRow label="Username" value={`@${user?.username}`} />
        <InfoRow label="E-mail" value={user?.email ?? '—'} />
        <InfoRow label="Telefone" value={user?.telefone ?? '—'} />
        <InfoRow label="Cidade" value={user?.cidade ?? profile?.cidade ?? '—'} />
        {profile?.bio ? (
          <View style={styles.bioRow}>
            <Text style={styles.infoLabel}>Bio</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        ) : null}
      </View>

      {profile?.categories && profile.categories.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Especialidades</Text>
          <View style={styles.tagsRow}>
            {profile.categories.map((cat) => (
              <View key={cat.id} style={styles.tag}>
                <Text style={styles.tagText}>{cat.nome}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {profile?.portfolio && profile.portfolio.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Portfólio ({profile.portfolio.length} imagens)</Text>
        </View>
      ) : null}

      <AppButton
        title="Editar perfil"
        onPress={() => navigation.navigate('EditProfessionalProfile')}
      />
      <AppButton title="Sair" variant="danger" onPress={() => void signOut()} />
    </ScrollView>
  );
}

function AdminProfileView({ navigation }: any) {
  const { user, signOut } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.avatarPlaceholder, styles.avatarAdmin]}>
        <Text style={styles.avatarInitial}>{user?.nome?.[0]?.toUpperCase() ?? 'A'}</Text>
      </View>

      <Text style={styles.name}>{user?.nome}</Text>
      <View style={[styles.badge, styles.badgeAdmin]}>
        <Text style={styles.badgeText}>Admin</Text>
      </View>

      <View style={styles.card}>
        <InfoRow label="Username" value={`@${user?.username}`} />
        <InfoRow label="E-mail" value={user?.email ?? '—'} />
      </View>

      <AppButton title="Sair" variant="danger" onPress={() => void signOut()} />
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
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
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  avatarAdmin: {
    backgroundColor: colors.secondary,
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  badgeProfessional: {
    backgroundColor: colors.secondary,
  },
  badgeVerified: {
    backgroundColor: colors.success,
  },
  badgeAdmin: {
    backgroundColor: colors.secondary,
  },
  badgeText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  ratingStar: {
    fontSize: 18,
    color: '#F5A623',
  },
  ratingCount: {
    fontSize: 13,
    color: colors.textMuted,
  },
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontWeight: '700',
    color: colors.text,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bioRow: {
    gap: 4,
  },
  infoLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  infoValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
    flexShrink: 1,
    textAlign: 'right',
  },
  bioText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.secondaryLight,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  tagText: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
});

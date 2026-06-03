import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { useAuth } from '../hooks/useAuth';
import { clientProfileService } from '../services/client-profile.service';
import { professionalProfileService } from '../services/professional-profile.service';
import { colors, spacing } from '../theme';
import { ClientProfile, ProfessionalProfile } from '../types/profiles';

export function ProfileScreen({ navigation }: any) {
  const { user } = useAuth();

  if (!user) return null;

  if (user.perfil === 'PROFISSIONAL') return <ProfessionalProfileView navigation={navigation} />;
  if (user.perfil === 'ADMIN') return <AdminProfileView navigation={navigation} />;
  return <ClientProfileView navigation={navigation} />;
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

  const initial = user?.nome?.[0]?.toUpperCase() ?? '?';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={[colors.primary, '#E5532B']} style={styles.heroBand}>
        <View style={styles.avatarRing}>
          <View style={[styles.avatar, styles.avatarClient]}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
        </View>
        <Text style={styles.heroName}>{user?.nome}</Text>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>Cliente</Text>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informações</Text>
          <InfoRow label="Username" value={`@${user?.username}`} />
          <InfoRow label="E-mail" value={user?.email ?? '—'} />
          <InfoRow label="Telefone" value={user?.telefone ?? '—'} />
          <InfoRow label="Cidade" value={user?.cidade ?? '—'} />
        </View>

        <AppButton title="Minhas contratações" variant="ghost" onPress={() => navigation.navigate('MyRequests')} />
        <AppButton title="Editar perfil" onPress={() => navigation.navigate('EditClientProfile')} />
        <AppButton title="Sair da conta" variant="danger" onPress={() => void signOut()} />
      </View>
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
        <ActivityIndicator color={colors.secondary} />
      </View>
    );
  }

  const initial = user?.nome?.[0]?.toUpperCase() ?? '?';
  const rating = parseFloat(profile?.avaliacaoMedia ?? '0');
  const stars = Math.round(rating);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={[colors.secondary, '#094F55']} style={styles.heroBand}>
        <View style={styles.avatarRing}>
          <View style={[styles.avatar, styles.avatarProfessional]}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
        </View>
        <View style={styles.heroNameRow}>
          <Text style={styles.heroName}>{user?.nome}</Text>
          {profile?.isVerified ? <Text style={styles.verifiedBadge}>✓ Verificado</Text> : null}
        </View>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>Profissional</Text>
        </View>
        <View style={styles.ratingRow}>
          <Text style={styles.ratingStars}>
            {Array.from({ length: 5 }, (_, i) => (i < stars ? '★' : '☆')).join('')}
          </Text>
          <Text style={styles.ratingText}>
            {rating.toFixed(1)} ({profile?.totalAvaliacoes ?? 0})
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {profile?.bio ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sobre mim</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        ) : null}

        {profile?.categories && profile.categories.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Especialidades</Text>
            <View style={styles.chipsRow}>
              {profile.categories.map((cat) => (
                <View key={cat.id} style={styles.chip}>
                  <Text style={styles.chipText}>{cat.nome}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contato</Text>
          <InfoRow label="Username" value={`@${user?.username}`} />
          <InfoRow label="E-mail" value={user?.email ?? '—'} />
          <InfoRow label="Telefone" value={user?.telefone ?? '—'} />
          <InfoRow label="Cidade" value={user?.cidade ?? profile?.cidade ?? '—'} />
        </View>

        {profile?.portfolio && profile.portfolio.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Portfólio</Text>
            <Text style={styles.portfolioCount}>{profile.portfolio.length} imagens</Text>
          </View>
        ) : null}

        <AppButton title="Solicitações recebidas" variant="ghost" onPress={() => navigation.navigate('IncomingRequests')} />
        <AppButton title="Disponibilidade" variant="ghost" onPress={() => navigation.navigate('EditAvailability')} />
        <AppButton
          title="Editar perfil"
          onPress={() => navigation.navigate('EditProfessionalProfile')}
        />
        <AppButton title="Sair da conta" variant="danger" onPress={() => void signOut()} />
      </View>
    </ScrollView>
  );
}

function AdminProfileView({ navigation }: any) {
  const { user, signOut } = useAuth();
  const initial = user?.nome?.[0]?.toUpperCase() ?? 'A';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#1A3A5C', '#122840']} style={styles.heroBand}>
        <View style={styles.avatarRing}>
          <View style={[styles.avatar, styles.avatarAdmin]}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
        </View>
        <Text style={styles.heroName}>{user?.nome}</Text>
        <View style={[styles.heroBadge, styles.heroBadgeAdmin]}>
          <Text style={styles.heroBadgeText}>Administrador</Text>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Conta</Text>
          <InfoRow label="Username" value={`@${user?.username}`} />
          <InfoRow label="E-mail" value={user?.email ?? '—'} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Painel administrativo</Text>
          <Text style={styles.adminHint}>
            Use as abas abaixo para gerenciar usuários e categorias do sistema.
          </Text>
        </View>

        <AppButton title="Sair da conta" variant="danger" onPress={() => void signOut()} />
      </View>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBand: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl + 16,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarClient: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  avatarProfessional: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  avatarAdmin: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  avatarInitial: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFF',
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
  },
  verifiedBadge: {
    backgroundColor: colors.success,
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 14,
  },
  heroBadgeAdmin: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  heroBadgeText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  ratingStars: {
    fontSize: 16,
    color: '#F5A623',
    letterSpacing: 1,
  },
  ratingText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  body: {
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: colors.background,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 2,
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
    paddingLeft: spacing.sm,
  },
  bioText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 22,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: colors.secondaryLight,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  chipText: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
  portfolioCount: {
    color: colors.textMuted,
    fontSize: 13,
  },
  adminHint: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
});

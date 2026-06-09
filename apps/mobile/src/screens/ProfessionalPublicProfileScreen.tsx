import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { availabilityService } from '../services/availability.service';
import { professionalProfileService } from '../services/professional-profile.service';
import { colors, spacing } from '../theme';
import { ProfessionalProfile } from '../types/profiles';
import { AvailabilitySlot } from '../types/service-requests';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

export function ProfessionalPublicProfileScreen({ route, navigation }: any) {
  const { userId } = route.params as { userId: string };
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      professionalProfileService.getPublic(userId).catch(() => null),
      availabilityService.getPublic(userId).catch(() => []),
    ])
      .then(([prof, avail]) => {
        setProfile(prof);
        setAvailability((avail ?? []).filter((s) => s.ativo));
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.secondary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Profissional não encontrado.</Text>
      </View>
    );
  }

  const rating = parseFloat(profile.avaliacaoMedia ?? '0');
  const stars = Math.round(rating);
  const initial = profile.nome?.[0]?.toUpperCase() ?? '?';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={[colors.secondary, '#094F55']} style={styles.heroBand}>
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
        </View>
        <Text style={styles.heroName}>{profile.nome}</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.ratingStars}>
            {Array.from({ length: 5 }, (_, i) => (i < stars ? '★' : '☆')).join('')}
          </Text>
          <Text style={styles.ratingText}>
            {rating.toFixed(1)} ({profile.totalAvaliacoes ?? 0} avaliações)
          </Text>
        </View>
        {profile.cidade ? (
          <Text style={styles.cityText}>{profile.cidade}</Text>
        ) : null}
      </LinearGradient>

      <View style={styles.body}>
        {profile.bio ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sobre</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        ) : null}

        {profile.categories && profile.categories.length > 0 ? (
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

        {availability.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Disponibilidade</Text>
            {availability.map((slot) => (
              <View key={slot.id} style={styles.availRow}>
                <Text style={styles.availDay}>{DAYS[slot.diaSemana]}</Text>
                <Text style={styles.availTime}>
                  {slot.horaInicio} – {slot.horaFim}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <AppButton
          title="Solicitar serviço"
          onPress={() =>
            navigation.navigate('NewRequest', {
              professionalId: userId,
              professionalNome: profile.nome,
            })
          }
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: colors.textMuted, fontSize: 15 },
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
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontSize: 34, fontWeight: '800', color: '#FFF' },
  heroName: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  ratingStars: { fontSize: 16, color: '#F5A623', letterSpacing: 1 },
  ratingText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  cityText: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
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
  cardTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
  bioText: { color: colors.text, fontSize: 14, lineHeight: 22 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    backgroundColor: colors.secondaryLight,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  chipText: { color: colors.secondary, fontSize: 12, fontWeight: '700' },
  availRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  availDay: { fontWeight: '700', color: colors.text, fontSize: 13 },
  availTime: { color: colors.textMuted, fontSize: 13 },
});

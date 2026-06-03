import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { useAuth } from '../hooks/useAuth';
import { availabilityService } from '../services/availability.service';
import { colors, spacing } from '../theme';

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

type SlotState = {
  ativo: boolean;
  horaInicio: string;
  horaFim: string;
};

const DEFAULT_SLOTS: SlotState[] = DAYS.map((_, i) => ({
  ativo: i >= 1 && i <= 5,
  horaInicio: '08:00',
  horaFim: '18:00',
}));

export function EditAvailabilityScreen({ navigation }: any) {
  const { token } = useAuth();
  const [slots, setSlots] = useState<SlotState[]>(DEFAULT_SLOTS);
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    availabilityService
      .getMe(token)
      .then((data) => {
        if (data.length === 0) return;
        const updated = [...DEFAULT_SLOTS];
        for (const slot of data) {
          updated[slot.diaSemana] = {
            ativo: slot.ativo,
            horaInicio: slot.horaInicio,
            horaFim: slot.horaFim,
          };
        }
        setSlots(updated);
      })
      .catch(() => null)
      .finally(() => setLoadingData(false));
  }, [token]);

  const update = (index: number, field: keyof SlotState, value: boolean | string) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const save = async () => {
    if (!token) return;
    setError(null);
    setLoading(true);
    try {
      const payload = slots
        .map((s, i) => ({ diaSemana: i, horaInicio: s.horaInicio, horaFim: s.horaFim, ativo: s.ativo }))
        .filter((s) => s.ativo);
      await availabilityService.save(payload, token);
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar disponibilidade.');
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.hint}>
        Ative os dias em que você está disponível para atendimento.
      </Text>

      <View style={styles.card}>
        {DAYS.map((day, i) => (
          <View key={day} style={[styles.dayRow, i < DAYS.length - 1 && styles.dayRowBorder]}>
            <View style={styles.dayLeft}>
              <Switch
                value={slots[i].ativo}
                onValueChange={(v) => update(i, 'ativo', v)}
                trackColor={{ true: colors.secondary, false: colors.border }}
                thumbColor={slots[i].ativo ? '#FFF' : '#FFF'}
              />
              <Text style={[styles.dayLabel, !slots[i].ativo && styles.dayLabelOff]}>
                {day}
              </Text>
            </View>

            {slots[i].ativo ? (
              <View style={styles.timeRow}>
                <AppInput
                  label=""
                  value={slots[i].horaInicio}
                  onChangeText={(v) => update(i, 'horaInicio', v)}
                  placeholder="08:00"
                  style={styles.timeInput}
                  autoCapitalize="none"
                />
                <Text style={styles.timeSep}>–</Text>
                <AppInput
                  label=""
                  value={slots[i].horaFim}
                  onChangeText={(v) => update(i, 'horaFim', v)}
                  placeholder="18:00"
                  style={styles.timeInput}
                  autoCapitalize="none"
                />
              </View>
            ) : (
              <Text style={styles.unavailable}>Indisponível</Text>
            )}
          </View>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <AppButton title="Salvar disponibilidade" onPress={() => void save()} loading={loading} />
      <AppButton title="Cancelar" variant="ghost" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xl },
  hint: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  dayRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  dayLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dayLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  dayLabelOff: { color: colors.textMuted },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  timeInput: { width: 64, minHeight: 36, textAlign: 'center', fontSize: 13 },
  timeSep: { color: colors.textMuted, fontWeight: '600' },
  unavailable: { fontSize: 13, color: colors.textMuted },
  error: { color: colors.danger, fontSize: 13, textAlign: 'center' },
});

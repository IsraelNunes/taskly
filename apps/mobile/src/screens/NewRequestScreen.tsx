import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { useAuth } from '../hooks/useAuth';
import { categoryService } from '../services/category.service';
import { serviceRequestService } from '../services/service-request.service';
import { colors, spacing } from '../theme';
import { ServiceCategory } from '../types/profiles';

export function NewRequestScreen({ route, navigation }: any) {
  const { professionalId, professionalNome } = route.params as {
    professionalId: string;
    professionalNome: string;
  };
  const { token } = useAuth();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [descricao, setDescricao] = useState('');
  const [endereco, setEndereco] = useState('');
  const [dataAgendada, setDataAgendada] = useState('');
  const [valorEstimado, setValorEstimado] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void categoryService.list().then(setCategories).catch(() => null);
  }, []);

  const submit = async () => {
    if (!token) return;
    if (!descricao.trim()) {
      setError('Descreva o serviço que você precisa.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await serviceRequestService.create(
        {
          professionalId,
          descricao: descricao.trim(),
          endereco: endereco.trim() || undefined,
          dataAgendada: dataAgendada.trim() || undefined,
          valorEstimado: valorEstimado ? parseFloat(valorEstimado) : undefined,
        },
        token,
      );
      navigation.navigate('MyRequests');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar a solicitação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.wrapper}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Profissional</Text>
          <View style={styles.card}>
            <Text style={styles.professionalName}>{professionalNome}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Detalhes do serviço</Text>
          <View style={styles.card}>
            <AppInput
              label="Descrição"
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Descreva o que você precisa..."
              multiline
              numberOfLines={4}
              style={styles.multiline}
            />
            <AppInput
              label="Endereço"
              value={endereco}
              onChangeText={setEndereco}
              placeholder="Rua, número, bairro..."
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Agendamento (opcional)</Text>
          <View style={styles.card}>
            <AppInput
              label="Data desejada"
              value={dataAgendada}
              onChangeText={setDataAgendada}
              placeholder="Ex: 2026-06-15"
              autoCapitalize="none"
            />
            <AppInput
              label="Valor estimado (R$)"
              value={valorEstimado}
              onChangeText={setValorEstimado}
              placeholder="Ex: 150"
              keyboardType="numeric"
            />
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.actions}>
          <AppButton title="Enviar solicitação" onPress={() => void submit()} loading={loading} />
          <AppButton title="Cancelar" variant="ghost" onPress={() => navigation.goBack()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xl },
  section: { gap: spacing.sm },
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
  professionalName: { fontSize: 16, fontWeight: '700', color: colors.text },
  multiline: { minHeight: 96, paddingTop: 12, textAlignVertical: 'top' },
  error: { color: colors.danger, fontSize: 13, textAlign: 'center' },
  actions: { gap: spacing.sm },
});

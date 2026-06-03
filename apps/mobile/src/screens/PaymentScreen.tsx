import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { useAuth } from '../hooks/useAuth';
import { serviceRequestService } from '../services/service-request.service';
import { colors, spacing } from '../theme';

type Metodo = 'PIX' | 'CARTAO' | 'DINHEIRO';

const METODOS: { value: Metodo; label: string }[] = [
  { value: 'PIX', label: 'Pix' },
  { value: 'CARTAO', label: 'Cartão' },
  { value: 'DINHEIRO', label: 'Dinheiro' },
];

export function PaymentScreen({ route, navigation }: any) {
  const { requestId, valor: valorInicial } = route.params as {
    requestId: string;
    valor: number;
  };
  const { token } = useAuth();
  const [valor, setValor] = useState(valorInicial > 0 ? valorInicial.toFixed(2) : '');
  const [metodo, setMetodo] = useState<Metodo>('PIX');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = async () => {
    if (!token) return;
    const valorNum = parseFloat(valor);
    if (!valor || isNaN(valorNum) || valorNum <= 0) {
      setError('Informe o valor do pagamento.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await serviceRequestService.createPayment(requestId, { valor: valorNum, metodo }, token);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar pagamento.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Text style={styles.successCheck}>✓</Text>
        </View>
        <Text style={styles.successTitle}>Pagamento registrado!</Text>
        <Text style={styles.successDesc}>
          O pagamento de R$ {parseFloat(valor).toFixed(2)} via {metodo} foi confirmado.
        </Text>
        <AppButton
          title="Voltar às contratações"
          onPress={() => navigation.navigate('MyRequests')}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Valor</Text>
        <View style={styles.card}>
          <AppInput
            label="Valor (R$)"
            value={valor}
            onChangeText={setValor}
            placeholder="Ex: 150.00"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Forma de pagamento</Text>
        <View style={styles.metodosRow}>
          {METODOS.map((m) => (
            <Pressable
              key={m.value}
              style={[styles.metodoCard, metodo === m.value && styles.metodoCardActive]}
              onPress={() => setMetodo(m.value)}
            >
              <Text style={[styles.metodoLabel, metodo === m.value && styles.metodoLabelActive]}>
                {m.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <AppButton title="Confirmar pagamento" onPress={() => void submit()} loading={loading} />
      <AppButton title="Cancelar" variant="ghost" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xl },
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
  },
  metodosRow: { flexDirection: 'row', gap: spacing.sm },
  metodoCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  metodoCardActive: { borderColor: colors.primary, backgroundColor: '#FFF3EE' },
  metodoLabel: { fontWeight: '700', fontSize: 14, color: colors.textMuted },
  metodoLabelActive: { color: colors.primary },
  error: { color: colors.danger, fontSize: 13, textAlign: 'center' },
  successContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCheck: { color: '#FFF', fontSize: 36, fontWeight: '900' },
  successTitle: { fontSize: 24, fontWeight: '800', color: colors.text },
  successDesc: { color: colors.textMuted, textAlign: 'center', lineHeight: 22, fontSize: 15 },
});

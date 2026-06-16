import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { useAuth } from '../hooks/useAuth';
import { serviceRequestService } from '../services/service-request.service';
import { colors, spacing } from '../theme';
import { CartaoPayload, Payment } from '../types/service-requests';

type Metodo = 'PIX' | 'CARTAO' | 'DINHEIRO';

function formatCpf(digits: string): string {
  const d = digits.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

const METODOS: { value: Metodo; label: string; icon: string }[] = [
  { value: 'PIX', label: 'Pix', icon: '⚡' },
  { value: 'CARTAO', label: 'Cartão', icon: '💳' },
  { value: 'DINHEIRO', label: 'Dinheiro', icon: '💵' },
];

export function PaymentScreen({ route, navigation }: any) {
  const { requestId, valor: valorInicial } = route.params as {
    requestId: string;
    valor: number;
  };
  const { token } = useAuth();

  const [valor, setValor] = useState(valorInicial > 0 ? valorInicial.toFixed(2) : '');
  const [metodo, setMetodo] = useState<Metodo>('PIX');
  const [cpf, setCpf] = useState('');
  const [cartao, setCartao] = useState<CartaoPayload>({
    holderName: '',
    number: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    email: '',
    cep: '',
    numeroEndereco: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States for after payment creation
  const [payment, setPayment] = useState<Payment | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const startPolling = (pmt: Payment) => {
    if (pmt.status === 'PAGO') return;
    pollingRef.current = setInterval(async () => {
      if (!token) return;
      try {
        const updated = await serviceRequestService.getPayment(requestId, token);
        if (updated && updated.status === 'PAGO') {
          setPayment(updated);
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      } catch {
        // ignora erros de polling
      }
    }, 5000);

    // Para o polling após 5 minutos
    setTimeout(() => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    }, 5 * 60 * 1000);
  };

  const validateAndSubmit = async () => {
    if (!token) return;

    const valorNum = parseFloat(valor);
    if (!valor || isNaN(valorNum) || valorNum <= 0) {
      setError('Informe o valor do pagamento.');
      return;
    }

    if (metodo !== 'DINHEIRO') {
      if (cpf.replace(/\D/g, '').length !== 11) {
        setError('Informe um CPF válido com 11 dígitos.');
        return;
      }
    }

    if (metodo === 'CARTAO') {
      if (!cartao.holderName || !cartao.number || !cartao.expiryMonth || !cartao.expiryYear || !cartao.cvv) {
        setError('Preencha todos os dados do cartão.');
        return;
      }
      if (!cartao.email || !cartao.cep || !cartao.numeroEndereco) {
        setError('Preencha os dados de cobrança do titular.');
        return;
      }
    }

    setError(null);
    setLoading(true);

    try {
      const result = await serviceRequestService.createPayment(
        requestId,
        {
          valor: valorNum,
          metodo,
          cpf: metodo !== 'DINHEIRO' ? cpf.replace(/\D/g, '') : undefined,
          cartao: metodo === 'CARTAO' ? cartao : undefined,
        },
        token,
      );
      setPayment(result);
      if (result.status !== 'PAGO') {
        startPolling(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar pagamento.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Estado: pagamento PIX aguardando confirmação ──────────────────────────
  if (payment && metodo === 'PIX' && payment.status !== 'PAGO') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.pixTitle}>Pague com PIX</Text>
        <Text style={styles.pixSubtitle}>
          Escaneie o QR code ou copie o código para pagar.
        </Text>

        {payment.pixQrCode ? (
          <View style={styles.qrContainer}>
            <Image
              source={{ uri: `data:image/png;base64,${payment.pixQrCode}` }}
              style={styles.qrImage}
              resizeMode="contain"
            />
          </View>
        ) : null}

        {payment.pixCopiaCola ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PIX Copia e Cola</Text>
            <View style={styles.pixCodeBox}>
              <TextInput
                style={styles.pixCodeText}
                value={payment.pixCopiaCola}
                editable={false}
                selectTextOnFocus
                multiline
              />
            </View>
            <Text style={styles.pixHint}>Toque no código para selecionar e copiar.</Text>
          </View>
        ) : null}

        <View style={styles.waitingRow}>
          <Text style={styles.waitingText}>⏳ Aguardando confirmação do pagamento...</Text>
        </View>

        <AppButton
          title="Já paguei / Verificar status"
          onPress={async () => {
            if (!token) return;
            try {
              const updated = await serviceRequestService.getPayment(requestId, token);
              if (updated) setPayment(updated);
            } catch {
              Alert.alert('Erro', 'Não foi possível verificar o status.');
            }
          }}
        />
        <AppButton title="Cancelar" variant="ghost" onPress={() => navigation.goBack()} />
      </ScrollView>
    );
  }

  // ─── Estado: pagamento confirmado (PAGO) ──────────────────────────────────
  if (payment && payment.status === 'PAGO') {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Text style={styles.successCheck}>✓</Text>
        </View>
        <Text style={styles.successTitle}>Pagamento confirmado!</Text>
        <Text style={styles.successDesc}>
          R$ {parseFloat(payment.valor).toFixed(2)} via {payment.metodo} registrado com sucesso.
        </Text>
        <AppButton
          title="Voltar às contratações"
          onPress={() => navigation.navigate('MyRequests')}
        />
      </View>
    );
  }

  // ─── Formulário principal ─────────────────────────────────────────────────
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
              <Text style={styles.metodoIcon}>{m.icon}</Text>
              <Text style={[styles.metodoLabel, metodo === m.value && styles.metodoLabelActive]}>
                {m.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {metodo !== 'DINHEIRO' ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Seu CPF</Text>
          <View style={styles.card}>
            <AppInput
              label="CPF"
              value={cpf}
              onChangeText={(v) => setCpf(formatCpf(v))}
              placeholder="000.000.000-00"
              keyboardType="numeric"
            />
          </View>
        </View>
      ) : null}

      {metodo === 'CARTAO' ? (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Dados do cartão</Text>
            <View style={styles.card}>
              <AppInput
                label="Nome impresso no cartão"
                value={cartao.holderName}
                onChangeText={(v) => setCartao((c) => ({ ...c, holderName: v }))}
                placeholder="Como está no cartão"
              />
              <AppInput
                label="Número do cartão"
                value={cartao.number}
                onChangeText={(v) => setCartao((c) => ({ ...c, number: v.replace(/\D/g, '') }))}
                placeholder="0000 0000 0000 0000"
                keyboardType="numeric"
              />
              <View style={styles.row}>
                <View style={styles.flex1}>
                  <AppInput
                    label="Mês (MM)"
                    value={cartao.expiryMonth}
                    onChangeText={(v) => setCartao((c) => ({ ...c, expiryMonth: v }))}
                    placeholder="MM"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.flex1}>
                  <AppInput
                    label="Ano (AAAA)"
                    value={cartao.expiryYear}
                    onChangeText={(v) => setCartao((c) => ({ ...c, expiryYear: v }))}
                    placeholder="AAAA"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.flex1}>
                  <AppInput
                    label="CVV"
                    value={cartao.cvv}
                    onChangeText={(v) => setCartao((c) => ({ ...c, cvv: v }))}
                    placeholder="000"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Dados de cobrança</Text>
            <View style={styles.card}>
              <AppInput
                label="E-mail"
                value={cartao.email}
                onChangeText={(v) => setCartao((c) => ({ ...c, email: v }))}
                placeholder="seu@email.com"
                keyboardType="email-address"
              />
              <View style={styles.row}>
                <View style={styles.flex2}>
                  <AppInput
                    label="CEP"
                    value={cartao.cep}
                    onChangeText={(v) => setCartao((c) => ({ ...c, cep: v.replace(/\D/g, '') }))}
                    placeholder="00000-000"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.flex1}>
                  <AppInput
                    label="Número"
                    value={cartao.numeroEndereco}
                    onChangeText={(v) => setCartao((c) => ({ ...c, numeroEndereco: v }))}
                    placeholder="123"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          </View>
        </>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <AppButton
        title="Confirmar pagamento"
        onPress={() => void validateAndSubmit()}
        loading={loading}
      />
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
    gap: spacing.sm,
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
    gap: 4,
  },
  metodoCardActive: { borderColor: colors.primary, backgroundColor: '#FFF3EE' },
  metodoIcon: { fontSize: 20 },
  metodoLabel: { fontWeight: '700', fontSize: 13, color: colors.textMuted },
  metodoLabelActive: { color: colors.primary },
  row: { flexDirection: 'row', gap: spacing.sm },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  error: { color: colors.danger, fontSize: 13, textAlign: 'center' },

  // PIX
  pixTitle: { fontSize: 22, fontWeight: '800', color: colors.text, textAlign: 'center' },
  pixSubtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  qrImage: { width: 220, height: 220 },
  pixCodeBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  pixCodeText: {
    fontSize: 11,
    color: colors.text,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  pixHint: { fontSize: 11, color: colors.textMuted, textAlign: 'center' },
  waitingRow: {
    backgroundColor: '#FFF8E7',
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  waitingText: { color: '#B8860B', fontWeight: '600', fontSize: 14 },

  // Success
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

import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { useAuth } from '../hooks/useAuth';
import { serviceRequestService } from '../services/service-request.service';
import { colors, spacing } from '../theme';
import { ServiceRequest, ServiceRequestStatus } from '../types/service-requests';

const STATUS_LABEL: Record<ServiceRequestStatus, string> = {
  PENDENTE: 'Aguardando confirmação',
  CONFIRMADO: 'Confirmado',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
};

const STATUS_COLOR: Record<ServiceRequestStatus, string> = {
  PENDENTE: '#F5A623',
  CONFIRMADO: colors.secondary,
  EM_ANDAMENTO: colors.primary,
  CONCLUIDO: colors.success,
  CANCELADO: colors.danger,
};

export function RequestDetailScreen({ route, navigation }: any) {
  const { requestId } = route.params as { requestId: string };
  const { user, token } = useAuth();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    serviceRequestService
      .getOne(requestId, token)
      .then(setRequest)
      .catch(() => setError('Contratação não encontrada.'))
      .finally(() => setLoading(false));
  }, [requestId, token]);

  useFocusEffect(load);

  const doAction = async (action: () => Promise<any>, goBack = false) => {
    setActionLoading(true);
    setError(null);
    try {
      await action();
      if (goBack) {
        navigation.goBack();
      } else {
        load();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar ação.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!request) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error ?? 'Contratação não encontrada.'}</Text>
      </View>
    );
  }

  const status = request.status as ServiceRequestStatus;
  const isProfessional = user?.id === request.professionalId || user?.perfil === 'PROFISSIONAL';
  const isClient = user?.id === request.clientId || user?.perfil === 'CLIENTE';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.statusBanner, { backgroundColor: STATUS_COLOR[status] + '18' }]}>
        <Text style={[styles.statusText, { color: STATUS_COLOR[status] }]}>
          {STATUS_LABEL[status]}
        </Text>
      </View>

      <View style={styles.card}>
        <InfoRow label="Categoria" value={request.categoriaNome ?? '—'} />
        <InfoRow
          label="Data solicitada"
          value={
            request.dataAgendada
              ? new Date(request.dataAgendada).toLocaleDateString('pt-BR')
              : '—'
          }
        />
        <InfoRow label="Endereço" value={request.endereco ?? '—'} />
        {request.valorEstimado ? (
          <InfoRow label="Valor estimado" value={`R$ ${parseFloat(request.valorEstimado).toFixed(2)}`} />
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Descrição</Text>
        <Text style={styles.descText}>{request.descricao}</Text>
      </View>

      {request.payment ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pagamento</Text>
          <InfoRow label="Valor" value={`R$ ${parseFloat(request.payment.valor).toFixed(2)}`} />
          <InfoRow label="Método" value={request.payment.metodo} />
          <InfoRow label="Status" value={request.payment.status} />
        </View>
      ) : null}

      {request.motivoCancelamento ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Motivo do cancelamento</Text>
          <Text style={styles.descText}>{request.motivoCancelamento}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        {isProfessional && status === 'PENDENTE' && (
          <>
            <AppButton
              title="Confirmar solicitação"
              variant="secondary"
              loading={actionLoading}
              onPress={() => doAction(() => serviceRequestService.confirmar(request.id, token!))}
            />
            <AppButton
              title="Recusar"
              variant="danger"
              loading={actionLoading}
              onPress={() => doAction(() => serviceRequestService.cancelar(request.id, 'Recusado pelo profissional.', token!))}
            />
          </>
        )}
        {isProfessional && status === 'CONFIRMADO' && (
          <AppButton
            title="Iniciar serviço"
            loading={actionLoading}
            onPress={() => doAction(() => serviceRequestService.iniciar(request.id, token!))}
          />
        )}
        {isProfessional && status === 'EM_ANDAMENTO' && (
          <AppButton
            title="Concluir serviço"
            variant="secondary"
            loading={actionLoading}
            onPress={() => doAction(() => serviceRequestService.concluir(request.id, token!))}
          />
        )}
        {isClient && status === 'CONCLUIDO' && !request.payment && (
          <AppButton
            title="Registrar pagamento"
            onPress={() =>
              navigation.navigate('Payment', {
                requestId: request.id,
                valor: parseFloat(request.valorEstimado ?? '0'),
              })
            }
          />
        )}
        {['PENDENTE', 'CONFIRMADO'].includes(status) && (
          <AppButton
            title="Cancelar contratação"
            variant="danger"
            loading={actionLoading}
            onPress={() => doAction(() => serviceRequestService.cancelar(request.id, undefined, token!))}
          />
        )}
        {['CONCLUIDO', 'CANCELADO'].includes(status) && !confirmDelete && (
          <AppButton
            title="Excluir do histórico"
            variant="ghost"
            loading={actionLoading}
            onPress={() => setConfirmDelete(true)}
          />
        )}
        {confirmDelete && (
          <View style={styles.confirmBox}>
            <Text style={styles.confirmText}>
              Excluir esta contratação do histórico? Esta ação não pode ser desfeita.
            </Text>
            <View style={styles.confirmActions}>
              <View style={styles.flex1}>
                <AppButton
                  title="Cancelar"
                  variant="ghost"
                  onPress={() => setConfirmDelete(false)}
                />
              </View>
              <View style={styles.flex1}>
                <AppButton
                  title="Excluir"
                  variant="danger"
                  loading={actionLoading}
                  onPress={() =>
                    doAction(() => serviceRequestService.remove(request.id, token!), true)
                  }
                />
              </View>
            </View>
          </View>
        )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
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
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statusBanner: {
    borderRadius: 14,
    padding: spacing.md,
    alignItems: 'center',
  },
  statusText: { fontSize: 16, fontWeight: '800' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  infoValue: { color: colors.text, fontSize: 13, fontWeight: '500', textAlign: 'right', flexShrink: 1, paddingLeft: spacing.sm },
  descText: { color: colors.text, fontSize: 14, lineHeight: 22 },
  actions: { gap: spacing.sm },
  confirmBox: {
    backgroundColor: '#FFF5F5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.danger + '40',
    padding: spacing.md,
    gap: spacing.sm,
  },
  confirmText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  confirmActions: { flexDirection: 'row', gap: spacing.sm },
  flex1: { flex: 1 },
  error: { color: colors.danger, fontSize: 13, textAlign: 'center' },
  errorText: { color: colors.textMuted, fontSize: 15 },
});

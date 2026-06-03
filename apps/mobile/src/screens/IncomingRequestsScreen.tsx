import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../hooks/useAuth';
import { serviceRequestService } from '../services/service-request.service';
import { colors, spacing } from '../theme';
import { ServiceRequest, ServiceRequestStatus } from '../types/service-requests';

const STATUS_LABEL: Record<ServiceRequestStatus, string> = {
  PENDENTE: 'Pendente',
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

export function IncomingRequestsScreen({ navigation }: any) {
  const { token } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      setLoading(true);
      serviceRequestService
        .list(token)
        .then(setRequests)
        .catch(() => setError('Erro ao carregar solicitações.'))
        .finally(() => setLoading(false));
    }, [token]),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.secondary} />
      </View>
    );
  }

  const pending = requests.filter((r) => r.status === 'PENDENTE');
  const others = requests.filter((r) => r.status !== 'PENDENTE');

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={[...pending, ...others]}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('RequestDetail', { requestId: item.id })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardCategory}>{item.categoriaNome ?? 'Serviço'}</Text>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: STATUS_COLOR[item.status as ServiceRequestStatus] + '22' },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: STATUS_COLOR[item.status as ServiceRequestStatus] },
                  ]}
                >
                  {STATUS_LABEL[item.status as ServiceRequestStatus]}
                </Text>
              </View>
            </View>
            <Text style={styles.clientName}>Cliente: {item.clienteNome ?? '—'}</Text>
            <Text style={styles.cardDesc} numberOfLines={2}>{item.descricao}</Text>
            {item.dataAgendada ? (
              <Text style={styles.cardDate}>
                {new Date(item.dataAgendada).toLocaleDateString('pt-BR')}
              </Text>
            ) : null}
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            title="Nenhuma solicitação recebida"
            description="Quando clientes solicitarem seus serviços, eles aparecerão aqui."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: spacing.md, gap: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardCategory: { fontSize: 15, fontWeight: '700', color: colors.text },
  badge: { borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  clientName: { fontSize: 13, fontWeight: '600', color: colors.secondary },
  cardDesc: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
  cardDate: { fontSize: 12, color: colors.textMuted },
  error: { color: colors.danger, padding: spacing.md, textAlign: 'center' },
});

import {
  CreatePaymentPayload,
  CreateServiceRequestPayload,
  Payment,
  ServiceRequest,
} from '../types/service-requests';
import { apiRequest } from './http';

export const serviceRequestService = {
  create(payload: CreateServiceRequestPayload, token: string) {
    return apiRequest<ServiceRequest>('/contratacoes', { method: 'POST', body: payload, token });
  },

  list(token: string) {
    return apiRequest<ServiceRequest[]>('/contratacoes', { token });
  },

  getOne(id: string, token: string) {
    return apiRequest<ServiceRequest>(`/contratacoes/${id}`, { token });
  },

  confirmar(id: string, token: string) {
    return apiRequest<ServiceRequest>(`/contratacoes/${id}/confirmar`, { method: 'PATCH', token });
  },

  iniciar(id: string, token: string) {
    return apiRequest<ServiceRequest>(`/contratacoes/${id}/iniciar`, { method: 'PATCH', token });
  },

  concluir(id: string, token: string) {
    return apiRequest<ServiceRequest>(`/contratacoes/${id}/concluir`, { method: 'PATCH', token });
  },

  cancelar(id: string, motivo: string | undefined, token: string) {
    return apiRequest<ServiceRequest>(`/contratacoes/${id}/cancelar`, {
      method: 'PATCH',
      body: { motivoCancelamento: motivo },
      token,
    });
  },

  createPayment(requestId: string, payload: CreatePaymentPayload, token: string) {
    return apiRequest<Payment>(`/contratacoes/${requestId}/pagamento`, {
      method: 'POST',
      body: payload,
      token,
    });
  },

  getPayment(requestId: string, token: string) {
    return apiRequest<Payment | null>(`/contratacoes/${requestId}/pagamento`, { token });
  },
};

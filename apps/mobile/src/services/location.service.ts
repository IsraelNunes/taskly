import { City, Uf } from '../types/admin';
import { apiRequest } from './http';

export const locationService = {
  listUfs() {
    return apiRequest<Uf[]>('/ufs');
  },

  createUf(payload: { sigla: string; nome: string }, token: string) {
    return apiRequest<Uf>('/ufs', {
      method: 'POST',
      token,
      body: payload,
    });
  },

  updateUf(id: string, payload: { sigla?: string; nome?: string }, token: string) {
    return apiRequest<Uf>(`/ufs/${id}`, {
      method: 'PUT',
      token,
      body: payload,
    });
  },

  removeUf(id: string, token: string) {
    return apiRequest<{ message: string }>(`/ufs/${id}`, {
      method: 'DELETE',
      token,
    });
  },

  listCities(ufId?: string) {
    const suffix = ufId ? `?ufId=${ufId}` : '';
    return apiRequest<City[]>(`/cidades${suffix}`);
  },

  createCity(payload: { nome: string; ufId: string }, token: string) {
    return apiRequest<City>('/cidades', {
      method: 'POST',
      token,
      body: payload,
    });
  },

  updateCity(id: string, payload: { nome?: string; ufId?: string }, token: string) {
    return apiRequest<City>(`/cidades/${id}`, {
      method: 'PUT',
      token,
      body: payload,
    });
  },

  removeCity(id: string, token: string) {
    return apiRequest<{ message: string }>(`/cidades/${id}`, {
      method: 'DELETE',
      token,
    });
  },
};

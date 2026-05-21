import { ClientProfile, UpdateClientProfilePayload } from '../types/profiles';
import { apiRequest } from './http';

export const clientProfileService = {
  getMe(token: string) {
    return apiRequest<ClientProfile>('/perfil-cliente/me', { token });
  },

  updateMe(payload: UpdateClientProfilePayload, token: string) {
    return apiRequest<ClientProfile>('/perfil-cliente/me', {
      method: 'PUT',
      token,
      body: payload,
    });
  },

  getPublic(userId: string) {
    return apiRequest<ClientProfile>(`/perfil-cliente/${userId}`);
  },
};

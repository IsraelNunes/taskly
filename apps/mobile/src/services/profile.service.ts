import { Profile } from '../types/admin';
import { apiRequest } from './http';

export const profileService = {
  list() {
    return apiRequest<Profile[]>('/perfis');
  },

  create(descricao: string, token: string) {
    return apiRequest<Profile>('/perfis', {
      method: 'POST',
      token,
      body: { descricao },
    });
  },

  update(id: string, descricao: string, token: string) {
    return apiRequest<Profile>(`/perfis/${id}`, {
      method: 'PUT',
      token,
      body: { descricao },
    });
  },

  remove(id: string, token: string) {
    return apiRequest<{ message: string }>(`/perfis/${id}`, {
      method: 'DELETE',
      token,
    });
  },
};

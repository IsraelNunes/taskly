import { AdminUser } from '../types/admin';
import { AuthUser } from '../types/auth';
import { apiRequest } from './http';

export const userService = {
  me(token: string) {
    return apiRequest<AuthUser>('/usuarios/me', { token });
  },

  updateMe(
    payload: { nome?: string; username?: string; email?: string; telefone?: string; avatarUrl?: string; password?: string },
    token: string,
  ) {
    return apiRequest<AuthUser>('/usuarios/me', {
      method: 'PUT',
      token,
      body: payload,
    });
  },

  adminList(token: string) {
    return apiRequest<AdminUser[]>('/usuarios', { token });
  },

  adminCreate(
    payload: { nome: string; username: string; password: string; perfil?: string },
    token: string,
  ) {
    return apiRequest<AdminUser>('/usuarios', {
      method: 'POST',
      token,
      body: payload,
    });
  },

  adminUpdate(
    id: string,
    payload: { nome?: string; username?: string; password?: string; perfil?: string },
    token: string,
  ) {
    return apiRequest<AdminUser>(`/usuarios/${id}`, {
      method: 'PUT',
      token,
      body: payload,
    });
  },

  adminRemove(id: string, token: string) {
    return apiRequest<{ message: string }>(`/usuarios/${id}`, {
      method: 'DELETE',
      token,
    });
  },
};

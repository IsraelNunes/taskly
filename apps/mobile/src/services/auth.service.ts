import { AuthResponse, AuthUser, LoginPayload, RegisterPayload } from '../types/auth';
import { apiRequest } from './http';

export const authService = {
  login(payload: LoginPayload) {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: payload,
    });
  },

  register(payload: RegisterPayload) {
    return apiRequest<AuthResponse>('/auth/cadastro', {
      method: 'POST',
      body: payload,
    });
  },

  me(token: string) {
    return apiRequest<AuthUser>('/auth/me', {
      method: 'GET',
      token,
    });
  },
};

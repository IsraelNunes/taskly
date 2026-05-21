import { ProfileRole } from './roles';

export type AuthUser = {
  id: string;
  nome: string;
  username: string;
  email: string | null;
  telefone: string | null;
  avatarUrl: string | null;
  perfil: ProfileRole;
  cidade: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type RegisterPayload = {
  nome: string;
  username: string;
  password: string;
  perfil?: 'CLIENTE' | 'PROFISSIONAL';
};

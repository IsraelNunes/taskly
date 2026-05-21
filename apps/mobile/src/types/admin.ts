import { ProfileRole } from './roles';

export type Profile = {
  id: string;
  descricao: ProfileRole;
  createdAt: string;
  updatedAt: string;
};

export type Uf = {
  id: string;
  sigla: string;
  nome: string;
  createdAt: string;
  updatedAt: string;
};

export type City = {
  id: string;
  nome: string;
  ufId: string;
  ufSigla: string;
  ufNome: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminUser = {
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

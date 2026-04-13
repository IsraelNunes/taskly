export type AuthUser = {
  id: string;
  nome: string;
  username: string;
  perfil: string;
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
};

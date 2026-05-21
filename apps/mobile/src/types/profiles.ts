export type ServiceCategory = {
  id: string;
  nome: string;
  icone: string | null;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

export type PortfolioImage = {
  id: string;
  professionalProfileId: string;
  imageUrl: string;
  descricao: string | null;
  ordem: number;
  createdAt: string;
  updatedAt: string;
};

export type ClientProfile = {
  id: string;
  userId: string;
  nome: string;
  avatarUrl: string | null;
  email: string | null;
  telefone: string | null;
  perfil: string;
  cidade: string | null;
  notificacoesAtivas: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProfessionalProfile = {
  id: string;
  userId: string;
  nome: string;
  username: string;
  email: string | null;
  telefone: string | null;
  avatarUrl: string | null;
  bio: string | null;
  perfil: string;
  cidade: string | null;
  cidadeId: string | null;
  avaliacaoMedia: string;
  totalAvaliacoes: number;
  isVerified: boolean;
  categories: ServiceCategory[];
  portfolio: PortfolioImage[];
  createdAt: string;
  updatedAt: string;
};

export type ProfessionalSummary = {
  id: string;
  userId: string;
  nome: string;
  avatarUrl: string | null;
  bio: string | null;
  avaliacaoMedia: string;
  totalAvaliacoes: number;
  isVerified: boolean;
  cidade: string | null;
};

export type UpdateClientProfilePayload = {
  notificacoesAtivas?: boolean;
};

export type UpdateProfessionalProfilePayload = {
  bio?: string;
  cidadeId?: string;
  categoryIds?: string[];
};

export type AddPortfolioImagePayload = {
  imageUrl: string;
  descricao?: string;
  ordem?: number;
};

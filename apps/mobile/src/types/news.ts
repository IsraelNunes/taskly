export type NewsStatus = 'RASCUNHO' | 'PUBLICADO';

export type NewsSummary = {
  id: string;
  titulo: string;
  imagem: string | null;
  resumo: string;
  status: NewsStatus;
  dataCriacao: string;
  dataPublicacao: string | null;
  autorNome: string;
  autorId: string;
};

export type NewsDetail = NewsSummary & {
  texto: string;
};

export type NewsInput = {
  titulo: string;
  imagem?: string;
  resumo: string;
  texto: string;
  status: NewsStatus;
};

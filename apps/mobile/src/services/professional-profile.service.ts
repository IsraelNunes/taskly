import {
  AddPortfolioImagePayload,
  PortfolioImage,
  ProfessionalProfile,
  ProfessionalSummary,
  UpdateProfessionalProfilePayload,
} from '../types/profiles';
import { apiRequest } from './http';

export const professionalProfileService = {
  list() {
    return apiRequest<ProfessionalSummary[]>('/perfil-profissional');
  },

  getMe(token: string) {
    return apiRequest<ProfessionalProfile>('/perfil-profissional/me', { token });
  },

  updateMe(payload: UpdateProfessionalProfilePayload, token: string) {
    return apiRequest<ProfessionalProfile>('/perfil-profissional/me', {
      method: 'PUT',
      token,
      body: payload,
    });
  },

  getPublic(userId: string) {
    return apiRequest<ProfessionalProfile>(`/perfil-profissional/${userId}`);
  },

  addPortfolioImage(payload: AddPortfolioImagePayload, token: string) {
    return apiRequest<PortfolioImage>('/perfil-profissional/portfolio', {
      method: 'POST',
      token,
      body: payload,
    });
  },

  removePortfolioImage(imageId: string, token: string) {
    return apiRequest<{ message: string }>(`/perfil-profissional/portfolio/${imageId}`, {
      method: 'DELETE',
      token,
    });
  },
};

import { AvailabilitySlot } from '../types/service-requests';
import { apiRequest } from './http';

type UpsertSlot = Omit<AvailabilitySlot, 'id'>;

export const availabilityService = {
  getMe(token: string) {
    return apiRequest<AvailabilitySlot[]>('/disponibilidade/me', { token });
  },

  save(slots: UpsertSlot[], token: string) {
    return apiRequest<AvailabilitySlot[]>('/disponibilidade/me', {
      method: 'PUT',
      body: { slots },
      token,
    });
  },

  getPublic(userId: string) {
    return apiRequest<AvailabilitySlot[]>(`/disponibilidade/${userId}`);
  },
};

import { ServiceCategory } from '../types/profiles';
import { apiRequest } from './http';

export const categoryService = {
  list() {
    return apiRequest<ServiceCategory[]>('/categorias');
  },
};

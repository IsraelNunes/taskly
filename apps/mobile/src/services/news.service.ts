import { NewsDetail, NewsInput, NewsSummary } from '../types/news';
import { apiRequest } from './http';

export const newsService = {
  list() {
    return apiRequest<NewsSummary[]>('/noticias');
  },

  detail(id: string) {
    return apiRequest<NewsDetail>(`/noticias/${id}`);
  },

  create(payload: NewsInput, token: string) {
    return apiRequest<NewsDetail>('/noticias', {
      method: 'POST',
      token,
      body: payload,
    });
  },

  update(id: string, payload: NewsInput, token: string) {
    return apiRequest<NewsDetail>(`/noticias/${id}`, {
      method: 'PUT',
      token,
      body: payload,
    });
  },

  remove(id: string, token: string) {
    return apiRequest<{ message: string }>(`/noticias/${id}`, {
      method: 'DELETE',
      token,
    });
  },
};

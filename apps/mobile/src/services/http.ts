const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3333/api';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const buildMessage = (data: unknown, fallback: string): string => {
  if (!data || typeof data !== 'object') {
    return fallback;
  }

  const message = Reflect.get(data, 'message');

  if (Array.isArray(message)) {
    return message.join('\n');
  }

  if (typeof message === 'string') {
    return message;
  }

  return fallback;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    throw new ApiError(buildMessage(data, 'Erro ao processar solicitação.'), response.status, data);
  }

  return data as T;
}

export { API_URL };

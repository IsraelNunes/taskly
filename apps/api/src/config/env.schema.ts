import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3333),
  API_PREFIX: z.string().default('api'),
  CORS_ORIGIN: z.string().default('*'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(8),
  JWT_EXPIRES_IN: z.string().default('1d'),
});

export type EnvSchema = z.infer<typeof envSchema>;

export const validateEnv = (config: Record<string, unknown>): EnvSchema => envSchema.parse(config);

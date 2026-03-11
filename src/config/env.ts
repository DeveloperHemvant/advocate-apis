import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().min(1).default('30m'),
  JWT_REFRESH_EXPIRES_IN: z.string().min(1).default('30d'),
  CORS_ORIGINS: z.string().min(1).default('*'),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);

export function getCorsOrigins(): string[] | '*' {
  const raw = env.CORS_ORIGINS.trim();
  if (raw === '*') return '*';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}


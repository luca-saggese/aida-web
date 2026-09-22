import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/gotraxx-clone'),
  INFERENCE_API_URL: z.string().url().default('http://work.gotraxx.com:8082/v1/systemone'),
  INFERENCE_API_KEY: z.string().optional().default(''),
  INFERENCE_API_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
  API_KEY_PEPPER: z.string().default('change-me-to-a-long-random-string'),
  MOCK_GOTRAXX: z
    .string()
    .optional()
    .default('false')
    .transform((v) => v === 'true'),
  AIDA_INPUT_USD_PER_MILLION: z.coerce.number().default(0.042),
  AIDA_OUTPUT_USD_PER_MILLION: z.coerce.number().default(0),

  JWT_SECRET: z.string().min(1).default('change-me-jwt-secret'),
  JWT_EXPIRES_IN: z.string().min(1).default('7d'),
  EMAIL_VERIFY_TOKEN_EXPIRES: z.string().min(1).default('24h'),
  PASSWORD_RESET_TOKEN_EXPIRES: z.string().min(1).default('1h'),
  REQUIRE_EMAIL_CONFIRMATION: z
    .string()
    .optional()
    .default('false')
    .transform((v) => v === 'true'),

  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().optional().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  SMTP_FROM: z.string().optional().default('no-reply@gotraxx-clone.local'),
});

function resolveEnv(): z.infer<typeof envSchema> {
  const parsed = envSchema.safeParse(process.env);
  if (parsed.success) return parsed.data;

  if (process.env.NODE_ENV === 'test') {
    return envSchema.parse({
      ...process.env,
      NODE_ENV: 'test',
      MONGODB_URI: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/gotraxx-clone-test',
    });
  }

  // eslint-disable-next-line no-console
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration');
}

export const env = resolveEnv();

export function isMockMode(): boolean {
  return env.MOCK_GOTRAXX === true;
}

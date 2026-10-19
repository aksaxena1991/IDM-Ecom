import 'dotenv/config';

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8080),
  IMS_BE_URL: z.string().url().default('http://127.0.0.1:5001'),
  CORS_ORIGINS: z.string().default('http://localhost:3002,http://127.0.0.1:3002'),
  RATE_LIMIT_BUCKET_CAPACITY: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_REFILL_PER_SECOND: z.coerce.number().positive().default(10),
  CIRCUIT_BREAKER_FAILURE_THRESHOLD: z.coerce.number().int().positive().default(5),
  CIRCUIT_BREAKER_OPEN_MS: z.coerce.number().int().positive().default(30_000),
});

const parsed = envSchema.parse(process.env);

export const env = {
  ...parsed,
  corsOrigins: parsed.CORS_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};

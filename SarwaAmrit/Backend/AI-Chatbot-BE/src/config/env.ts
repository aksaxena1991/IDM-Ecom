import { config as loadDotenv } from 'dotenv'
import { z } from 'zod'

loadDotenv()

function parseCorsOrigins(raw: string | undefined): string[] {
  if (!raw?.trim()) return []
  const text = raw.trim()
  if (text.startsWith('[')) {
    const parsed = JSON.parse(text) as unknown
    if (!Array.isArray(parsed)) throw new Error('CORS_ORIGINS JSON must be an array')
    return parsed.map(String).filter(Boolean)
  }
  return text.split(',').map((s) => s.trim()).filter(Boolean)
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8100),
  LOG_LEVEL: z.string().default('info'),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().optional(),
  SSO_ISSUER: z.string().url(),
  SSO_JWKS_URI: z.string().url(),
  CORS_ORIGINS: z.string().optional(),
  CHAT_ADMIN_PERMISSIONS: z.string().default('admin:*,platform-super-admin:access'),
  CHAT_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(60),
})

const parsed = envSchema.safeParse(process.env)
if (!parsed.success) {
  console.error('Invalid environment:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

const data = parsed.data

export const env = {
  ...data,
  corsOrigins: parseCorsOrigins(data.CORS_ORIGINS),
  adminPermissions: data.CHAT_ADMIN_PERMISSIONS.split(',')
    .map((s) => s.trim())
    .filter(Boolean),
}

export type Env = typeof env

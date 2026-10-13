import { Redis } from 'ioredis'

import { env } from '../config/env.js'

let redis: Redis | null = null

function getRedis(): Redis | null {
  if (!env.REDIS_URL) return null
  if (!redis) {
    redis = new Redis(env.REDIS_URL, { maxRetriesPerRequest: 1, lazyConnect: true })
  }
  return redis
}

/** Matches SSO-BE key pattern `sso:revoked_token:{jti}`. */
export async function isAccessTokenRevoked(jti: string | undefined): Promise<boolean> {
  if (!jti) return false
  const client = getRedis()
  if (!client) return false
  try {
    if (client.status !== 'ready') await client.connect()
    const hit = await client.get(`sso:revoked_token:${jti}`)
    return hit != null
  } catch {
    return false
  }
}

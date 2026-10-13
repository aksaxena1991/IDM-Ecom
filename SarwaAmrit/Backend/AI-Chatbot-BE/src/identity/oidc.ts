import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'

import { env } from '../config/env.js'
import { UnauthorizedError } from '../core/errors.js'

export type AccessTokenClaims = JWTPayload & {
  sub: string
  tenant_id?: string
  aud?: string | string[]
  token_use?: string
  email?: string
  permissions?: string[]
  jti?: string
}

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null

function getJwks() {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(env.SSO_JWKS_URI))
  }
  return jwks
}

export function tokenAudience(claims: AccessTokenClaims): string {
  const aud = claims.aud
  if (typeof aud === 'string') return aud
  if (Array.isArray(aud) && aud.length > 0) return String(aud[0])
  throw new UnauthorizedError('Access token missing audience')
}

export async function verifyAccessToken(token: string): Promise<AccessTokenClaims> {
  try {
    const { payload } = await jwtVerify(token, getJwks(), {
      issuer: env.SSO_ISSUER,
    })
    const claims = payload as AccessTokenClaims
    if (!claims.sub) {
      throw new UnauthorizedError('Access token missing subject')
    }
    if (claims.token_use && claims.token_use !== 'access') {
      throw new UnauthorizedError('Invalid token type')
    }
    return claims
  } catch (err) {
    if (err instanceof UnauthorizedError) throw err
    throw new UnauthorizedError('Invalid access token')
  }
}

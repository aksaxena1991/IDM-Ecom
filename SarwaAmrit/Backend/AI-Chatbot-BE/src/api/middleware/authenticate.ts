import type { NextFunction, Request, Response } from 'express'

import { UnauthorizedError } from '../../core/errors.js'
import type { AccessTokenClaims } from '../../identity/oidc.js'
import { tokenAudience, verifyAccessToken } from '../../identity/oidc.js'
import { isAccessTokenRevoked } from '../../identity/tokenRevocation.js'

declare global {
  namespace Express {
    interface Request {
      authClaims?: AccessTokenClaims
      tokenAudience?: string
    }
  }
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const header = req.header('authorization')
    if (!header?.toLowerCase().startsWith('bearer ')) {
      throw new UnauthorizedError('Bearer token required')
    }
    const token = header.slice(7).trim()
    const claims = await verifyAccessToken(token)
    if (await isAccessTokenRevoked(claims.jti)) {
      throw new UnauthorizedError('Token revoked')
    }
    req.authClaims = claims
    req.tokenAudience = tokenAudience(claims)
    next()
  } catch (err) {
    next(err)
  }
}

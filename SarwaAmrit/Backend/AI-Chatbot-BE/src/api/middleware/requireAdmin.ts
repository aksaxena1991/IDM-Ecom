import type { NextFunction, Request, Response } from 'express'

import { env } from '../../config/env.js'
import { AppError } from '../../core/errors.js'

function hasAdminPermission(permissions: string[] | undefined): boolean {
  const held = new Set(permissions ?? [])
  for (const required of env.adminPermissions) {
    if (held.has(required)) return true
    if (required.endsWith(':*')) {
      const prefix = required.slice(0, -1)
      for (const p of held) {
        if (p.startsWith(prefix)) return true
      }
    }
  }
  const claimsAdmin = held.has('admin:*') || held.has('*')
  return claimsAdmin
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  const claims = req.authClaims
  if (!claims) {
    next(new AppError(401, 'unauthorized', 'Unauthorized'))
    return
  }
  const perms = (claims.permissions as string[] | undefined) ?? []
  const isAdminFlag = Boolean((claims as { is_admin?: boolean }).is_admin)
  if (isAdminFlag || hasAdminPermission(perms)) {
    next()
    return
  }
  next(new AppError(403, 'forbidden', 'Admin permission required'))
}

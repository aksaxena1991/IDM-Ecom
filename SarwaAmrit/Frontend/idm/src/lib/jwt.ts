export type AccessClaims = {
  sub?: string
  email?: string
  name?: string
  is_admin?: boolean
  scope?: string
  tenant_id?: string
  groups?: string[]
  roles?: string[]
  permissions?: string[]
  exp?: number
  sid?: string
}

export function decodeJwtPayload(token: string): AccessClaims | null {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as AccessClaims
  } catch {
    return null
  }
}

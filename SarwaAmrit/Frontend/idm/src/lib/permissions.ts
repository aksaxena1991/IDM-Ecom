/** Shared permission checks for nav gating and tests. */

export function hasAnyPermission(
  held: string[],
  required: string[],
  opts?: { isSuperAdmin?: boolean },
): boolean {
  if (opts?.isSuperAdmin) return true
  if (held.includes('admin:access') || held.includes('admin:*')) return true
  return required.some((p) => {
    if (held.includes(p)) return true
    const [family] = p.split(':')
    if (p.endsWith(':read') && held.includes(`${family}:write`)) return true
    return false
  })
}

export function claimsIndicateAdmin(
  claims: { is_admin?: unknown; roles?: unknown; permissions?: unknown; scope?: unknown } | null | undefined,
): boolean {
  if (!claims) return false
  if (claims.is_admin) return true
  const roles = Array.isArray(claims.roles) ? claims.roles.map(String) : []
  if (roles.includes('admin')) return true
  const permissions = Array.isArray(claims.permissions) ? claims.permissions.map(String) : []
  if (permissions.includes('admin:access') || permissions.includes('admin:*')) return true
  return String(claims.scope || '')
    .split(/\s+/)
    .includes('admin')
}

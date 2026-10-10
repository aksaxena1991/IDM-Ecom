import { describe, expect, it } from 'vitest'
import { claimsIndicateAdmin, hasAnyPermission } from './permissions'

describe('hasAnyPermission', () => {
  it('allows super admin', () => {
    expect(hasAnyPermission([], ['policies:write'], { isSuperAdmin: true })).toBe(true) // opts object
  })

  it('allows admin:access as bypass', () => {
    expect(hasAnyPermission(['admin:access'], ['audit:read'])).toBe(true)
  })

  it('implies read from write', () => {
    expect(hasAnyPermission(['apps:write'], ['apps:read'])).toBe(true)
  })

  it('denies missing permission', () => {
    expect(hasAnyPermission(['users:write'], ['policies:write'])).toBe(false)
  })
})

describe('claimsIndicateAdmin', () => {
  it('detects roles and permissions', () => {
    expect(claimsIndicateAdmin({ roles: ['admin'] })).toBe(true)
    expect(claimsIndicateAdmin({ permissions: ['admin:access'] })).toBe(true)
    expect(claimsIndicateAdmin({ scope: 'openid admin' })).toBe(true)
    expect(claimsIndicateAdmin({ roles: ['user'] })).toBe(false)
  })
})

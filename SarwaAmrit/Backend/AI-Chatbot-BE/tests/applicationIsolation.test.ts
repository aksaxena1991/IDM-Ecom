import { describe, expect, it } from 'vitest'

import { ApplicationAccessDenied } from '../src/core/errors.js'
import { assertTokenMatchesApplication } from '../src/registry/applications.js'

describe('application isolation', () => {
  const app = {
    id: 'app-1',
    tenantId: 'tenant-1',
    slug: 'idm',
    name: 'IDM',
    ssoClientId: 'idm-oidc-app',
    status: 'active',
    activeConfig: {},
  }

  it('allows matching token audience', () => {
    expect(() => assertTokenMatchesApplication('idm-oidc-app', app)).not.toThrow()
  })

  it('denies cross-app token audience', () => {
    expect(() => assertTokenMatchesApplication('ims-oidc-app', app)).toThrow(ApplicationAccessDenied)
  })

  it('allows chat portal client for any registered app', () => {
    expect(() => assertTokenMatchesApplication('ai-chat-oidc-app', app)).not.toThrow()
  })
})

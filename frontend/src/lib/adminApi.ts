import { ApiError, ssoFetch, ssoJson } from './api'

export type AppItem = {
  id: string
  name: string
  client_id: string
  protocol: string
  status: string
  config: Record<string, unknown>
}

export type UserItem = {
  id: string
  email: string
  name: string | null
  status: string
  is_admin: boolean
}

export type AuditItem = {
  id: string
  actor: string
  action: string
  target: string | null
  occurred_at: string
  payload: Record<string, unknown>
}

export type PolicyItem = {
  id: string
  name: string
  description: string | null
  effect: 'allow' | 'deny'
  priority: number
  enabled: boolean
  actions: string[]
  resource_match: Record<string, unknown>
  conditions: Record<string, unknown>
}

export type EvaluateResult = {
  allowed: boolean
  reason: string
  message: string
  matched_policies: string[]
  action: string
  client_id: string
  user_id: string
}

export type RoleItem = {
  id: string
  name: string
  description: string | null
  is_system: boolean
  permissions: string[]
}

export type UserRolesResult = {
  user_id: string
  roles: RoleItem[]
  role_ids: string[]
  permissions: string[]
}

type StepUpHandler = () => Promise<void>

let stepUpHandler: StepUpHandler | null = null

export function registerStepUpHandler(handler: StepUpHandler | null) {
  stepUpHandler = handler
}

async function withStepUpRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && err.challenge === 'mfa_step_up') {
      if (!stepUpHandler) throw err
      await stepUpHandler()
      return fn()
    }
    throw err
  }
}

async function adminJson<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  return withStepUpRetry(async () => {
    const res = await ssoFetch(path, token, init)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new ApiError(res.status, body.title || res.statusText, body.detail, {
        challenge: body.challenge,
        body,
      })
    }
    if (res.status === 204) return undefined as T
    return res.json()
  })
}

export const adminApi = {
  listApps: (token: string) =>
    ssoJson<{ items: AppItem[] }>('/v1/apps', token),

  createApp: (
    token: string,
    body: {
      name: string
      protocol: 'oidc' | 'saml'
      redirect_uris?: string[]
      acs_url?: string
      entity_id?: string
      audience?: string
    },
  ) => adminJson<AppItem>('/v1/apps', token, { method: 'POST', body: JSON.stringify(body) }),

  patchApp: (
    token: string,
    id: string,
    body: Partial<{ name: string; status: string; redirect_uris: string[]; acs_url: string; entity_id: string; audience: string }>,
  ) => adminJson<AppItem>(`/v1/apps/${id}`, token, { method: 'PATCH', body: JSON.stringify(body) }),

  setAssignments: (
    token: string,
    appId: string,
    assignments: { principal_type: string; principal_id: string }[],
  ) =>
    adminJson<{ ok: boolean; count: number }>(`/v1/apps/${appId}/assignments`, token, {
      method: 'PUT',
      body: JSON.stringify({ assignments }),
    }),

  listUsers: (token: string, q?: string) => {
    const qs = new URLSearchParams({ page_size: '50' })
    if (q) qs.set('q', q)
    return ssoJson<{ items: UserItem[]; next_cursor: string | null }>(`/v1/users?${qs}`, token)
  },

  listAudit: (token: string) =>
    ssoJson<{ items: AuditItem[]; next_cursor: string | null }>('/v1/audit-events?page_size=50', token),

  getUserAttributes: (token: string, userId: string) =>
    ssoJson<{ user_id: string; attributes: Record<string, unknown> }>(
      `/v1/users/${userId}/attributes`,
      token,
    ),

  putUserAttributes: (token: string, userId: string, attributes: Record<string, unknown>) =>
    adminJson<{ user_id: string; attributes: Record<string, unknown> }>(
      `/v1/users/${userId}/attributes`,
      token,
      { method: 'PUT', body: JSON.stringify({ attributes }) },
    ),

  getAppAttributes: (token: string, appId: string) =>
    ssoJson<{ application_id: string; attributes: Record<string, unknown> }>(
      `/v1/apps/${appId}/attributes`,
      token,
    ),

  putAppAttributes: (token: string, appId: string, attributes: Record<string, unknown>) =>
    adminJson<{ application_id: string; attributes: Record<string, unknown> }>(
      `/v1/apps/${appId}/attributes`,
      token,
      { method: 'PUT', body: JSON.stringify({ attributes }) },
    ),

  listPolicies: (token: string) => ssoJson<{ items: PolicyItem[] }>('/v1/policies', token),

  createPolicy: (
    token: string,
    body: {
      name: string
      description?: string
      effect: 'allow' | 'deny'
      priority: number
      enabled: boolean
      actions: string[]
      resource_match: Record<string, unknown>
      conditions: Record<string, unknown>
    },
  ) => adminJson<PolicyItem>('/v1/policies', token, { method: 'POST', body: JSON.stringify(body) }),

  patchPolicy: (token: string, id: string, body: Record<string, unknown>) =>
    adminJson<PolicyItem>(`/v1/policies/${id}`, token, { method: 'PATCH', body: JSON.stringify(body) }),

  deletePolicy: (token: string, id: string) =>
    adminJson<{ ok: boolean }>(`/v1/policies/${id}`, token, { method: 'DELETE' }),

  evaluateAccess: (token: string, body: { user_id: string; client_id: string; action?: string }) =>
    ssoJson<EvaluateResult>('/v1/access/evaluate', token, {
      method: 'POST',
      body: JSON.stringify({ action: 'app:access', ...body }),
    }),

  listRoles: (token: string) => ssoJson<{ items: RoleItem[] }>('/v1/roles', token),

  createRole: (
    token: string,
    body: { name: string; description?: string; permissions: string[] },
  ) => adminJson<RoleItem>('/v1/roles', token, { method: 'POST', body: JSON.stringify(body) }),

  patchRole: (
    token: string,
    id: string,
    body: { description?: string | null; permissions?: string[] },
  ) => adminJson<RoleItem>(`/v1/roles/${id}`, token, { method: 'PATCH', body: JSON.stringify(body) }),

  deleteRole: (token: string, id: string) =>
    adminJson<{ ok: boolean }>(`/v1/roles/${id}`, token, { method: 'DELETE' }),

  getUserRoles: (token: string, userId: string) =>
    ssoJson<UserRolesResult>(`/v1/users/${userId}/roles`, token),

  putUserRoles: (token: string, userId: string, roleIds: string[]) =>
    adminJson<UserRolesResult>(`/v1/users/${userId}/roles`, token, {
      method: 'PUT',
      body: JSON.stringify({ role_ids: roleIds }),
    }),
}

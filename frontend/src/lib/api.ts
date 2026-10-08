import {
  OIDC_CLIENT_ID,
  OIDC_REDIRECT_URI,
  OIDC_SCOPE,
  OAUTH_STATE_KEY,
  PKCE_VERIFIER_KEY,
  SSO_BASE_URL,
} from '../config'
import { createCodeChallenge, createCodeVerifier } from './pkce'

export type TokenSet = {
  access_token: string
  id_token?: string
  refresh_token?: string
  token_type: string
  expires_in: number
  scope?: string
  obtained_at: number
}

export type UserInfo = {
  sub: string
  email?: string
  name?: string
  groups?: string[]
  roles?: string[]
  permissions?: string[]
  attributes?: Record<string, unknown>
  tenant_id?: string
}

export type SessionMe = {
  session_id: string
  user_id: string
  tenant_id: string
  expires_at: string
  absolute_expires_at: string
  mfa_verified_at: string | null
}

export class ApiError extends Error {
  status: number
  detail?: string
  challenge?: string
  body?: Record<string, unknown>

  constructor(
    status: number,
    title: string,
    detail?: string,
    extras?: { challenge?: string; body?: Record<string, unknown> },
  ) {
    super(detail || title)
    this.status = status
    this.detail = detail
    this.challenge = extras?.challenge
    this.body = extras?.body
  }
}

async function parseError(res: Response): Promise<ApiError> {
  try {
    const body = await res.json()
    return new ApiError(res.status, body.title || res.statusText, body.detail || body.error_description, {
      challenge: body.challenge,
      body,
    })
  } catch {
    return new ApiError(res.status, res.statusText)
  }
}

export async function loginWithPassword(
  email: string,
  password: string,
  tenantSlug = 'demo',
  mfaCode?: string,
): Promise<{ session_id: string; user_id: string }> {
  const res = await fetch(`${SSO_BASE_URL}/login/json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      email,
      password,
      tenant_slug: tenantSlug,
      mfa_code: mfaCode || null,
    }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (body?.mfa_required) {
      throw new ApiError(401, 'MFA required', 'MFA code required', { body })
    }
    throw new ApiError(
      res.status,
      body.title || res.statusText,
      body.detail || body.error_description || 'Login failed',
      { body },
    )
  }
  return body
}

export async function registerUser(input: {
  email: string
  password: string
  name?: string
  tenantSlug?: string
}): Promise<{ session_id: string; user_id: string; email: string }> {
  const res = await fetch(`${SSO_BASE_URL}/signup/json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      name: input.name || null,
      tenant_slug: input.tenantSlug || 'demo',
    }),
  })
  if (!res.ok) throw await parseError(res)
  return res.json()
}

export async function beginSsoLogin(): Promise<void> {
  const verifier = createCodeVerifier()
  const challenge = await createCodeChallenge(verifier)
  const state = crypto.randomUUID()
  sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier)
  sessionStorage.setItem(OAUTH_STATE_KEY, state)

  const url = new URL(`${SSO_BASE_URL}/oauth2/authorize`)
  url.searchParams.set('client_id', OIDC_CLIENT_ID)
  url.searchParams.set('redirect_uri', OIDC_REDIRECT_URI)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', OIDC_SCOPE)
  url.searchParams.set('state', state)
  url.searchParams.set('code_challenge', challenge)
  url.searchParams.set('code_challenge_method', 'S256')
  window.location.assign(url.toString())
}

export async function continueOidcAfterSession(): Promise<void> {
  await beginSsoLogin()
}

export async function exchangeCodeForTokens(code: string, state: string): Promise<TokenSet> {
  const expectedState = sessionStorage.getItem(OAUTH_STATE_KEY)
  const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY)
  if (!expectedState || state !== expectedState) {
    throw new Error('Invalid OAuth state. Please try signing in again.')
  }
  if (!verifier) {
    throw new Error('Missing PKCE verifier. Please try signing in again.')
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: OIDC_REDIRECT_URI,
    client_id: OIDC_CLIENT_ID,
    code_verifier: verifier,
  })

  const res = await fetch(`${SSO_BASE_URL}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) throw await parseError(res)
  const tokens = await res.json()
  sessionStorage.removeItem(PKCE_VERIFIER_KEY)
  sessionStorage.removeItem(OAUTH_STATE_KEY)
  return { ...tokens, obtained_at: Date.now() }
}

export async function refreshTokens(refreshToken: string): Promise<TokenSet> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: OIDC_CLIENT_ID,
  })
  const res = await fetch(`${SSO_BASE_URL}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) throw await parseError(res)
  const tokens = await res.json()
  return { ...tokens, obtained_at: Date.now() }
}

export async function fetchUserInfo(accessToken: string): Promise<UserInfo> {
  const res = await fetch(`${SSO_BASE_URL}/oauth2/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw await parseError(res)
  return res.json()
}

export async function logoutRemote(): Promise<void> {
  try {
    await fetch(`${SSO_BASE_URL}/session/logout`, {
      method: 'POST',
      credentials: 'include',
    })
  } catch {
    // ignore
  }
}

export async function fetchSessionMe(): Promise<SessionMe> {
  const res = await fetch(`${SSO_BASE_URL}/session/me`, { credentials: 'include' })
  if (!res.ok) throw await parseError(res)
  return res.json()
}

export async function enrollTotp(): Promise<{ factor_id: string; secret: string; otpauth_uri: string }> {
  const res = await fetch(`${SSO_BASE_URL}/mfa/totp/enroll`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) throw await parseError(res)
  return res.json()
}

export async function verifyTotp(code: string): Promise<{ verified: boolean }> {
  const res = await fetch(`${SSO_BASE_URL}/mfa/totp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ code }),
  })
  if (!res.ok) throw await parseError(res)
  return res.json()
}

export async function ssoFetch(
  path: string,
  accessToken: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${accessToken}`)
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  return fetch(`${SSO_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  })
}

export async function ssoJson<T>(
  path: string,
  accessToken: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await ssoFetch(path, accessToken, init)
  if (!res.ok) throw await parseError(res)
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

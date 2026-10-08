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
  tenant_id?: string
}

export class ApiError extends Error {
  status: number
  detail?: string

  constructor(status: number, title: string, detail?: string) {
    super(detail || title)
    this.status = status
    this.detail = detail
  }
}

async function parseError(res: Response): Promise<ApiError> {
  try {
    const body = await res.json()
    return new ApiError(res.status, body.title || res.statusText, body.detail || body.error_description)
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
  if (!res.ok) throw await parseError(res)
  return res.json()
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

/** Start OIDC authorize redirect (SSO hosted login if no session). */
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

/**
 * After email/password (or signup) established an SSO session cookie,
 * continue into OIDC to obtain tokens for this SPA.
 */
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
    // ignore network errors on logout
  }
}

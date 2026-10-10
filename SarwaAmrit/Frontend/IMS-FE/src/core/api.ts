import {
  DEFAULT_TENANT_SLUG,
  OAUTH_STATE_KEY,
  OIDC_CLIENT_ID,
  OIDC_REDIRECT_URI,
  OIDC_SCOPE,
  PKCE_VERIFIER_KEY,
  REFRESH_STORAGE_KEY,
  SSO_BASE_URL,
  TOKEN_STORAGE_KEY,
} from './config'
import { ApiError, parseProblemDetails } from './problemDetails'
import { createCodeChallenge, createCodeVerifier } from '../features/auth/utils/pkce'

export { ApiError } from './problemDetails'

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
  tenant_id?: string
}

export async function loginWithPassword(
  email: string,
  password: string,
  tenantSlug = DEFAULT_TENANT_SLUG,
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

const inflightCodeExchanges = new Map<string, Promise<TokenSet>>()

export async function exchangeCodeForTokens(code: string, state: string): Promise<TokenSet> {
  const key = `${code}:${state}`
  const existing = inflightCodeExchanges.get(key)
  if (existing) return existing

  const promise = (async () => {
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
    if (!res.ok) throw await parseProblemDetails(res)
    const tokens = await res.json()
    sessionStorage.removeItem(PKCE_VERIFIER_KEY)
    sessionStorage.removeItem(OAUTH_STATE_KEY)
    return { ...tokens, obtained_at: Date.now() } as TokenSet
  })()

  inflightCodeExchanges.set(key, promise)
  try {
    return await promise
  } catch (err) {
    inflightCodeExchanges.delete(key)
    throw err
  }
}

export async function fetchUserInfo(accessToken: string): Promise<UserInfo> {
  const res = await fetch(`${SSO_BASE_URL}/oauth2/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw await parseProblemDetails(res)
  return res.json()
}

export async function logoutRemote(): Promise<void> {
  try {
    await fetch(`${SSO_BASE_URL}/session/logout`, {
      method: 'POST',
      credentials: 'include',
    })
  } catch {
    // ignore network failures; local session is still cleared by the caller
  }
}

export function persistOidcSession(tokens: TokenSet): void {
  try {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens))
    if (tokens.refresh_token) {
      sessionStorage.setItem(REFRESH_STORAGE_KEY, tokens.refresh_token)
    }
  } catch {
    // ignore quota
  }
}

export function clearOidcSession(): void {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY)
  sessionStorage.removeItem(REFRESH_STORAGE_KEY)
  sessionStorage.removeItem(PKCE_VERIFIER_KEY)
  sessionStorage.removeItem(OAUTH_STATE_KEY)
}

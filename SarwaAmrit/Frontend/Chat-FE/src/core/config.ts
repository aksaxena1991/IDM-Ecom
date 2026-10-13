export const SSO_BASE_URL = import.meta.env.DEV
  ? '/sso'
  : (import.meta.env.VITE_SSO_BASE_URL ?? 'http://localhost:8000')

export const CHAT_API_BASE_URL = import.meta.env.DEV
  ? '/chat-api'
  : (import.meta.env.VITE_CHAT_API_BASE_URL ?? 'http://localhost:8100')

export const OIDC_CLIENT_ID = import.meta.env.VITE_OIDC_CLIENT_ID ?? 'ai-chat-oidc-app'

/** Must match the browser URL used during login (127.0.0.1 vs localhost are different origins). */
export function getOidcRedirectUri(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/callback`
  }
  return import.meta.env.VITE_OIDC_REDIRECT_URI ?? 'http://127.0.0.1:3003/callback'
}

export const OIDC_SCOPE = import.meta.env.VITE_OIDC_SCOPE ?? 'openid profile email groups'
export const DEFAULT_TENANT_SLUG = import.meta.env.VITE_DEFAULT_TENANT_SLUG ?? 'demo'

export const CHAT_APPLICATION_ID = import.meta.env.VITE_CHAT_APPLICATION_ID ?? 'idm'
export const CHAT_APPLICATION_LABEL =
  import.meta.env.VITE_CHAT_APPLICATION_LABEL ?? 'Sarwa Amrit Assistant'

export const REFRESH_STORAGE_KEY = 'chat_sso_refresh'
export const TOKEN_STORAGE_KEY = 'chat_sso_tokens'
export const PKCE_VERIFIER_KEY = 'chat_pkce_verifier'
export const OAUTH_STATE_KEY = 'chat_oauth_state'

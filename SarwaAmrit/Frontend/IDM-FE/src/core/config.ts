export const SSO_BASE_URL = import.meta.env.VITE_SSO_BASE_URL ?? 'http://localhost:8000'
export const OIDC_CLIENT_ID = import.meta.env.VITE_OIDC_CLIENT_ID ?? 'demo-oidc-app'
export const OIDC_REDIRECT_URI =
  import.meta.env.VITE_OIDC_REDIRECT_URI ?? 'http://localhost:3000/callback'
export const OIDC_SCOPE =
  import.meta.env.VITE_OIDC_SCOPE ?? 'openid profile email groups admin'

/** Only the refresh token is persisted (sessionStorage). Access tokens stay in memory. */
export const REFRESH_STORAGE_KEY = 'sso_portal_refresh'
export const TOKEN_STORAGE_KEY = 'sso_portal_tokens' // legacy key cleared on load
export const PKCE_VERIFIER_KEY = 'sso_pkce_verifier'
export const OAUTH_STATE_KEY = 'sso_oauth_state'
export const DEFAULT_TENANT_SLUG = import.meta.env.VITE_DEFAULT_TENANT_SLUG ?? 'demo'

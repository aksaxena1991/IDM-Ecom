export const SSO_BASE_URL = import.meta.env.VITE_SSO_BASE_URL ?? 'http://localhost:8000'
export const OIDC_CLIENT_ID = import.meta.env.VITE_OIDC_CLIENT_ID ?? 'ims-oidc-app'
export const OIDC_REDIRECT_URI =
  import.meta.env.VITE_OIDC_REDIRECT_URI ?? `${window.location.origin}/callback`
export const OIDC_SCOPE = import.meta.env.VITE_OIDC_SCOPE ?? 'openid profile email groups'
export const DEFAULT_TENANT_SLUG = import.meta.env.VITE_DEFAULT_TENANT_SLUG ?? 'demo'

export const REFRESH_STORAGE_KEY = 'ims_sso_refresh'
export const TOKEN_STORAGE_KEY = 'ims_sso_tokens'
export const PKCE_VERIFIER_KEY = 'ims_pkce_verifier'
export const OAUTH_STATE_KEY = 'ims_oauth_state'

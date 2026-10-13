export const SSO_BASE_URL = import.meta.env.VITE_SSO_BASE_URL ?? 'http://localhost:8000'
export const CHAT_API_BASE_URL = import.meta.env.VITE_CHAT_API_BASE_URL ?? 'http://localhost:8100'
export const OIDC_REDIRECT_URI =
  import.meta.env.VITE_OIDC_REDIRECT_URI ?? 'http://127.0.0.1:3003/callback'
export const OIDC_SCOPE = import.meta.env.VITE_OIDC_SCOPE ?? 'openid profile email groups'
export const DEFAULT_TENANT_SLUG = import.meta.env.VITE_DEFAULT_TENANT_SLUG ?? 'demo'

export const REFRESH_STORAGE_KEY = 'chat_sso_refresh'
export const TOKEN_STORAGE_KEY = 'chat_sso_tokens'
export const PKCE_VERIFIER_KEY = 'chat_pkce_verifier'
export const OAUTH_STATE_KEY = 'chat_oauth_state'

export type ChatProfile = {
  slug: string
  label: string
  clientId: string
}

/** Must match AI-Chatbot-BE registry slugs and SSO OIDC client_ids. */
export const CHAT_PROFILES: ChatProfile[] = [
  { slug: 'idm', label: 'Identity Management (IDM)', clientId: 'idm-oidc-app' },
  { slug: 'ims', label: 'Inventory Management (IMS)', clientId: 'ims-oidc-app' },
]

export const CHAT_PROFILE_STORAGE_KEY = 'chat_active_profile_slug'

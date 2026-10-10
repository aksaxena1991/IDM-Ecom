/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SSO_BASE_URL?: string
  readonly VITE_OIDC_CLIENT_ID?: string
  readonly VITE_OIDC_REDIRECT_URI?: string
  readonly VITE_OIDC_SCOPE?: string
  readonly VITE_DEFAULT_TENANT_SLUG?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

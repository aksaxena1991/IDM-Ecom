/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SSO_BASE_URL: string
  readonly VITE_CHAT_API_BASE_URL: string
  readonly VITE_OIDC_REDIRECT_URI: string
  readonly VITE_OIDC_CLIENT_ID: string
  readonly VITE_OIDC_SCOPE: string
  readonly VITE_DEFAULT_TENANT_SLUG: string
  readonly VITE_CHAT_APPLICATION_ID: string
  readonly VITE_CHAT_APPLICATION_LABEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

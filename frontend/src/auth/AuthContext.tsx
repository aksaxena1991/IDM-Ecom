import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { TOKEN_STORAGE_KEY } from '../config'
import {
  exchangeCodeForTokens,
  fetchUserInfo,
  logoutRemote,
  refreshTokens,
  type TokenSet,
  type UserInfo,
} from '../lib/api'
import { decodeJwtPayload } from '../lib/jwt'

type AuthContextValue = {
  user: UserInfo | null
  tokens: TokenSet | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  permissions: string[]
  hasPermission: (...perms: string[]) => boolean
  accessToken: string | null
  completeOidcCallback: (code: string, state: string) => Promise<void>
  setSessionFromTokens: (tokens: TokenSet) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadStoredTokens(): TokenSet | null {
  try {
    const raw = sessionStorage.getItem(TOKEN_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as TokenSet
  } catch {
    return null
  }
}

function persistTokens(tokens: TokenSet | null) {
  if (!tokens) {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY)
    return
  }
  sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens))
}

function tokenIsAdmin(tokens: TokenSet | null): boolean {
  if (!tokens?.access_token) return false
  const claims = decodeJwtPayload(tokens.access_token)
  if (!claims) return false
  if (claims.is_admin) return true
  const roles = Array.isArray(claims.roles) ? claims.roles.map(String) : []
  if (roles.includes('admin')) return true
  const permissions = Array.isArray(claims.permissions)
    ? claims.permissions.map(String)
    : []
  if (permissions.includes('admin:access') || permissions.includes('admin:*')) return true
  return String(claims.scope || '')
    .split(/\s+/)
    .includes('admin')
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = useState<TokenSet | null>(() => loadStoredTokens())
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const hydrateUser = useCallback(async (next: TokenSet) => {
    let current = next
    const ageMs = Date.now() - (current.obtained_at || 0)
    const expiresMs = (current.expires_in || 900) * 1000
    if (ageMs > expiresMs - 30_000 && current.refresh_token) {
      current = await refreshTokens(current.refresh_token)
      persistTokens(current)
      setTokens(current)
    }
    const info = await fetchUserInfo(current.access_token)
    setUser(info)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!tokens) {
        if (!cancelled) {
          setUser(null)
          setLoading(false)
        }
        return
      }
      try {
        await hydrateUser(tokens)
      } catch (err) {
        if (!cancelled) {
          persistTokens(null)
          setTokens(null)
          setUser(null)
          setError(err instanceof Error ? err.message : 'Session expired')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [tokens, hydrateUser])

  const setSessionFromTokens = useCallback(
    async (next: TokenSet) => {
      persistTokens(next)
      setTokens(next)
      setError(null)
      await hydrateUser(next)
    },
    [hydrateUser],
  )

  const completeOidcCallback = useCallback(
    async (code: string, state: string) => {
      setLoading(true)
      try {
        const next = await exchangeCodeForTokens(code, state)
        await setSessionFromTokens(next)
      } finally {
        setLoading(false)
      }
    },
    [setSessionFromTokens],
  )

  const logout = useCallback(async () => {
    await logoutRemote()
    persistTokens(null)
    setTokens(null)
    setUser(null)
    setError(null)
  }, [])

  const permissions = useMemo(() => {
    const fromUser = user?.permissions || []
    if (fromUser.length) return fromUser.map(String)
    if (!tokens?.access_token) return []
    const claims = decodeJwtPayload(tokens.access_token)
    return Array.isArray(claims?.permissions) ? claims.permissions.map(String) : []
  }, [user, tokens])

  const hasPermission = useCallback(
    (...perms: string[]) => {
      if (tokenIsAdmin(tokens)) return true
      if (permissions.includes('admin:access') || permissions.includes('admin:*')) return true
      return perms.some((p) => {
        if (permissions.includes(p)) return true
        const [family] = p.split(':')
        if (p.endsWith(':read') && permissions.includes(`${family}:write`)) return true
        return false
      })
    },
    [tokens, permissions],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      tokens,
      loading,
      error,
      isAuthenticated: Boolean(user && tokens),
      isAdmin: tokenIsAdmin(tokens) || hasPermission('admin:access'),
      permissions,
      hasPermission,
      accessToken: tokens?.access_token ?? null,
      completeOidcCallback,
      setSessionFromTokens,
      logout,
      clearError: () => setError(null),
    }),
    [
      user,
      tokens,
      loading,
      error,
      permissions,
      hasPermission,
      completeOidcCallback,
      setSessionFromTokens,
      logout,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

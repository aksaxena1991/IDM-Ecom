import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { REFRESH_STORAGE_KEY, TOKEN_STORAGE_KEY } from '../config'
import {
  exchangeCodeForTokens,
  fetchUserInfo,
  logoutRemote,
  refreshTokens,
  type TokenSet,
  type UserInfo,
} from '../lib/api'
import { decodeJwtPayload } from '../lib/jwt'
import { claimsIndicateAdmin, hasAnyPermission } from '../lib/permissions'

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

/** In-memory access token; only refresh_token is persisted to reduce XSS blast radius. */
let memoryAccess: TokenSet | null = null

function loadStoredRefresh(): string | null {
  try {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY)
    return sessionStorage.getItem(REFRESH_STORAGE_KEY)
  } catch {
    return null
  }
}

function persistRefresh(refreshToken: string | null) {
  try {
    if (!refreshToken) {
      sessionStorage.removeItem(REFRESH_STORAGE_KEY)
      sessionStorage.removeItem(TOKEN_STORAGE_KEY)
      return
    }
    sessionStorage.setItem(REFRESH_STORAGE_KEY, refreshToken)
  } catch {
    /* ignore quota */
  }
}

export function tokenIsAdmin(tokens: TokenSet | null): boolean {
  if (!tokens?.access_token) return false
  return claimsIndicateAdmin(decodeJwtPayload(tokens.access_token))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = useState<TokenSet | null>(() => memoryAccess)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const hydrateUser = useCallback(async (next: TokenSet) => {
    let current = next
    const ageMs = Date.now() - (current.obtained_at || 0)
    const expiresMs = (current.expires_in || 900) * 1000
    if (ageMs > expiresMs - 30_000 && current.refresh_token) {
      current = await refreshTokens(current.refresh_token)
      memoryAccess = current
      persistRefresh(current.refresh_token)
      setTokens(current)
    }
    const info = await fetchUserInfo(current.access_token)
    setUser(info)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (tokens) {
        try {
          await hydrateUser(tokens)
        } catch (err) {
          if (!cancelled) {
            memoryAccess = null
            persistRefresh(null)
            setTokens(null)
            setUser(null)
            setError(err instanceof Error ? err.message : 'Session expired')
          }
        } finally {
          if (!cancelled) setLoading(false)
        }
        return
      }
      const refresh = loadStoredRefresh()
      if (!refresh) {
        if (!cancelled) {
          setUser(null)
          setLoading(false)
        }
        return
      }
      try {
        const next = await refreshTokens(refresh)
        if (cancelled) return
        memoryAccess = next
        persistRefresh(next.refresh_token)
        setTokens(next)
        await hydrateUser(next)
      } catch (err) {
        if (!cancelled) {
          persistRefresh(null)
          memoryAccess = null
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
      memoryAccess = next
      persistRefresh(next.refresh_token)
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
    memoryAccess = null
    persistRefresh(null)
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
    (...perms: string[]) =>
      hasAnyPermission(permissions, perms, { isSuperAdmin: tokenIsAdmin(tokens) }),
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

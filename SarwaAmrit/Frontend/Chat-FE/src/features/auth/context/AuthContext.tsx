import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { REFRESH_STORAGE_KEY, TOKEN_STORAGE_KEY } from '../../../core/config'
import {
  exchangeCodeForTokens,
  fetchUserInfo,
  logoutRemote,
  refreshTokens,
  type TokenSet,
  type UserInfo,
} from '../../../core/api'
import { getActiveApplicationSlug } from '../../../core/chatProfile'

type AuthContextValue = {
  user: UserInfo | null
  tokens: TokenSet | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  accessToken: string | null
  applicationSlug: string
  completeOidcCallback: (code: string, state: string) => Promise<void>
  setSessionFromTokens: (tokens: TokenSet) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

let memoryAccess: TokenSet | null = null

function loadStoredRefresh(): string | null {
  try {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY)
    return sessionStorage.getItem(REFRESH_STORAGE_KEY)
  } catch {
    return null
  }
}

function persistRefresh(refreshToken: string | null | undefined) {
  try {
    if (!refreshToken) {
      sessionStorage.removeItem(REFRESH_STORAGE_KEY)
      sessionStorage.removeItem(TOKEN_STORAGE_KEY)
      return
    }
    sessionStorage.setItem(REFRESH_STORAGE_KEY, refreshToken)
  } catch {
    /* ignore */
  }
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

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      tokens,
      loading,
      error,
      isAuthenticated: Boolean(user && tokens),
      accessToken: tokens?.access_token ?? null,
      applicationSlug: getActiveApplicationSlug(),
      completeOidcCallback,
      setSessionFromTokens,
      logout,
      clearError: () => setError(null),
    }),
    [user, tokens, loading, error, completeOidcCallback, setSessionFromTokens, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

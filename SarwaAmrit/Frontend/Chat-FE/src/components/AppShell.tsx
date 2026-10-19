import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Typography, useTheme } from '@thoughtstream/ui'
import { LogOut, MessageCircle } from 'lucide-react'
import { clearOidcSession, logoutRemote } from '../core/api'
import { getApplicationLabel } from '../core/chatProfile'
import { clearSession, readSession, SESSION_KEY } from '../core/session'

type Props = {
  children: ReactNode
}

export function AppShell({ children }: Props) {
  const navigate = useNavigate()
  const { setTheme } = useTheme()
  const session = readSession()
  const applicationLabel = getApplicationLabel()

  useEffect(() => {
    setTheme('dark')
  }, [setTheme])

  const handleLogout = () => {
    void logoutRemote()
    clearOidcSession()
    clearSession()
    sessionStorage.removeItem(SESSION_KEY)
    navigate('/login')
  }

  return (
    <div className="chat-shell thoughtstream-theme-dark" data-theme="dark">
      <header className="chat-header">
        <div className="chat-header-brand">
          <MessageCircle size={20} strokeWidth={1.5} aria-hidden />
          <div>
            
            <Typography variant="caption" color="secondary" className="mono">
              {applicationLabel}
            </Typography>
          </div>
        </div>
        <div className="chat-header-actions">
          <Typography variant="caption" color="secondary">
            {session?.email}
          </Typography>
          <Button variant="secondary" size="small" onClick={handleLogout}>
            <LogOut size={14} aria-hidden />
            Sign out
          </Button>
        </div>
      </header>
      <main className="chat-main">{children}</main>
    </div>
  )
}

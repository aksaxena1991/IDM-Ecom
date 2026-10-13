import { Outlet } from 'react-router-dom'
import { Button, Typography } from '@thoughtstream/ui'
import { LogOut, MessageCircle } from 'lucide-react'
import { useAuth } from '../features/auth/context/AuthContext'
import { resolveChatProfile } from '../core/chatProfile'

export function AppShell() {
  const { user, logout, applicationSlug } = useAuth()
  const profile = resolveChatProfile(applicationSlug)

  return (
    <div className="chat-shell" data-theme="dark">
      <header className="chat-header">
        <div className="chat-header-brand">
          <MessageCircle size={20} strokeWidth={1.5} aria-hidden />
          <div>
            <Typography variant="overline" as="span">
              Sarwa Amrit Assistant
            </Typography>
            <Typography variant="caption" color="secondary" className="mono">
              {profile.label}
            </Typography>
          </div>
        </div>
        <div className="chat-header-actions">
          <Typography variant="caption" color="secondary">
            {user?.email}
          </Typography>
          <Button variant="secondary" size="small" onClick={() => void logout()}>
            <LogOut size={14} aria-hidden />
            Sign out
          </Button>
        </div>
      </header>
      <main className="chat-main">
        <Outlet />
      </main>
    </div>
  )
}

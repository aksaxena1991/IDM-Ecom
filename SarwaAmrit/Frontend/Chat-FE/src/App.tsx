import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { CallbackPage } from './features/auth/pages/CallbackPage'
import { LoginPage } from './features/auth/pages/LoginPage'
import { ChatPage } from './features/chat/pages/ChatPage'
import { SESSION_KEY } from './core/session'

function ChatRoute() {
  if (!sessionStorage.getItem(SESSION_KEY)) {
    return <Navigate to="/login" replace />
  }
  return (
    <AppShell>
      <ChatPage />
    </AppShell>
  )
}

export default function App() {
  const navigate = useNavigate()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage onNavigateToSignup={() => navigate('/login')} />} />
      <Route path="/callback" element={<CallbackPage />} />
      <Route path="/chat" element={<ChatRoute />} />
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

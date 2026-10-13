import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider, ToastProvider } from '@thoughtstream/ui'
import { AppShell } from './components/AppShell'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './features/auth/context/AuthContext'
import { CallbackPage } from './features/auth/pages/CallbackPage'
import { LoginPage } from './features/auth/pages/LoginPage'
import { ChatPage } from './features/chat/pages/ChatPage'

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/callback" element={<CallbackPage />} />
              <Route
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Navigate to="/chat" replace />} />
                <Route path="/chat" element={<ChatPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

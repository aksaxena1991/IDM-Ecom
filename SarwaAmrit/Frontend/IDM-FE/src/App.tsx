import { AuthProvider } from './features/auth/context/AuthContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { StepUpModalProvider } from './components/StepUpModal'
import { AppRoutes } from './AppRoutes'

/** IDM application without a router — hosts should provide BrowserRouter. */
export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <StepUpModalProvider>
          <AppRoutes />
        </StepUpModalProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App

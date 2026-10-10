import { ThemeProvider, ToastProvider } from '@thoughtstream/ui'
import App from './App'
import '@thoughtstream/ui/styles.css'
import './index.css'
import './core/styles/theme.css'

/**
 * Drop-in remote root for Module Federation hosts.
 * Includes design-system providers and styles; the host owns the router.
 */
export function IdmRoot() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="idm-theme">
      <ToastProvider>
        <App />
      </ToastProvider>
    </ThemeProvider>
  )
}

export default IdmRoot

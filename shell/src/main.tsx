import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ShellApp from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ShellApp />
  </StrictMode>,
)

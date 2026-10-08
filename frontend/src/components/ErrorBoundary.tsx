import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Portal error boundary', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <main className="dashboard">
          <h1>Something went wrong</h1>
          <p className="lede">Reload the page or sign in again. If it persists, contact your admin.</p>
          <p className="form-error mono">{this.state.error.message}</p>
          <button type="button" className="btn btn-primary" onClick={() => window.location.assign('/')}>
            Reload
          </button>
        </main>
      )
    }
    return this.props.children
  }
}

import { useEffect, useRef, useState } from 'react'

export default function ShellApp() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return

    let disposed = false
    let cleanup: (() => void) | undefined

    void import('idm/mount')
      .then(({ mount }) => {
        if (disposed || !rootRef.current) return
        cleanup = mount(rootRef.current)
      })
      .catch((err: unknown) => {
        if (!disposed) {
          setError(err instanceof Error ? err.message : 'Failed to load the IDM remote')
        }
      })

    return () => {
      disposed = true
      cleanup?.()
    }
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#1C1917' }}>
      {error ? (
        <div
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            color: '#E7E5E4',
            fontFamily: 'Inter, system-ui, sans-serif',
            padding: 24,
            textAlign: 'center',
          }}
        >
          <div>
            <p style={{ margin: '0 0 8px', fontWeight: 600 }}>IDM remote failed to load</p>
            <p style={{ margin: 0, color: '#A8A29E' }}>{error}</p>
            <p style={{ margin: '12px 0 0', color: '#A8A29E', fontSize: 13 }}>
              Start the IDM remote on http://localhost:3000
            </p>
          </div>
        </div>
      ) : (
        <div ref={rootRef} />
      )}
    </div>
  )
}

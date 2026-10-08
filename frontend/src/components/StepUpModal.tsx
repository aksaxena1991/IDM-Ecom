import { useEffect, useState, type FormEvent } from 'react'
import { registerStepUpHandler } from '../lib/adminApi'
import { verifyTotp } from '../lib/api'

export function StepUpModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [resolver, setResolver] = useState<{
    resolve: () => void
    reject: (err: Error) => void
  } | null>(null)

  useEffect(() => {
    registerStepUpHandler(
      () =>
        new Promise<void>((resolve, reject) => {
          setCode('')
          setError(null)
          setOpen(true)
          setResolver({ resolve, reject })
        }),
    )
    return () => registerStepUpHandler(null)
  }, [])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await verifyTotp(code.trim())
      setOpen(false)
      resolver?.resolve()
      setResolver(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid MFA code')
    } finally {
      setBusy(false)
    }
  }

  function onCancel() {
    setOpen(false)
    resolver?.reject(new Error('MFA step-up cancelled'))
    setResolver(null)
  }

  return (
    <>
      {children}
      {open && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal" role="dialog" aria-labelledby="stepup-title">
            <h2 id="stepup-title">Confirm with MFA</h2>
            <p className="lede">Admin writes require a recent MFA step-up. Enter your authenticator code.</p>
            <form className="stack" onSubmit={onSubmit}>
              <label>
                MFA code
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  required
                />
              </label>
              {error && <p className="form-error">{error}</p>}
              <div className="btn-row">
                <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={busy}>
                  {busy ? 'Verifying…' : 'Verify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

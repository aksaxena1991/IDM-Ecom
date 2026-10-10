import { useEffect, useState, type FormEvent } from 'react'
import { Button, Input, Modal, ModalBody, ModalFooter } from '@thoughtstream/ui'
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
      <Modal
        isOpen={open}
        onClose={onCancel}
        size="small"
        title="Privileged action step-up"
        subtitle="Administrative writes require a recent multi-factor assertion."
      >
        <form className="nn-stepup-form" onSubmit={onSubmit}>
          <ModalBody>
            <Input
              label="MFA one-time passcode"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              autoFocus
              required
              error={error || undefined}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onCancel} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={busy}>
              {busy ? 'Verifying…' : 'Authenticate & unlock'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  )
}

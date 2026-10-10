import type { ReactNode } from 'react'
import { Typography } from '@thoughtstream/ui'
import { NestMark } from './NestMark'

export function AuthGate({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div className="nn-gate" data-theme="dark">
      <div className="nn-gate-scrim">
        <div
          className="nn-gate-modal nn-gate-modal--signup"
          role="dialog"
          aria-modal="true"
          aria-labelledby="idm-gate-title"
        >
          <div className="nn-gate-auth nn-gate-auth--signup">
            <NestMark />
            <Typography id="idm-gate-title" variant="headline" as="h1" className="nn-gate-title">
              {title}
            </Typography>
            {subtitle ? (
              <Typography variant="bodySmall" color="secondary" className="nn-gate-subtitle">
                {subtitle}
              </Typography>
            ) : null}
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

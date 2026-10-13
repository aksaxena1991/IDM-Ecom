import type { PropsWithChildren } from 'react'
import { Typography } from '@thoughtstream/ui'

type Props = PropsWithChildren<{
  title: string
  subtitle?: string
}>

export function AuthGate({ title, subtitle, children }: Props) {
  return (
    <div className="nn-gate" data-theme="dark">
      <div className="nn-gate-scrim">
        <div className="chat-auth-card ts-card ts-card--padding-lg">
          <Typography variant="headline" as="h1" className="nn-gate-title">
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
  )
}

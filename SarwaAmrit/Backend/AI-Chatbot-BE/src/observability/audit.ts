import { db } from '../persistence/db.js'
import { auditEvents } from '../persistence/schema/index.js'

export async function recordAuditEvent(input: {
  tenantId: string
  applicationId?: string
  actorId: string
  eventType: string
  decision?: string
  correlationId: string
  payload?: Record<string, unknown>
}): Promise<void> {
  await db.insert(auditEvents).values({
    tenantId: input.tenantId,
    applicationId: input.applicationId,
    actorId: input.actorId,
    eventType: input.eventType,
    decision: input.decision,
    correlationId: input.correlationId,
    payloadJson: input.payload ?? {},
  })
}

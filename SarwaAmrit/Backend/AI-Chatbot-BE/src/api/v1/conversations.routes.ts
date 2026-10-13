import type { Request } from 'express'
import { Router } from 'express'
import { z } from 'zod'

import { AppError, UnauthorizedError } from '../../core/errors.js'
import { createRequestContext } from '../../core/requestContext.js'
import {
  getConversationForSubject,
  listMessages,
} from '../../persistence/repositories/conversations.js'
import { resolveApplicationForChat } from '../../registry/applications.js'
import { authenticate } from '../middleware/authenticate.js'

export const conversationsRouter = Router()

const appQuerySchema = z.object({
  application_id: z.string().min(1),
})

async function buildContext(req: Request, applicationSlug: string) {
  const claims = req.authClaims
  if (!claims?.sub || !req.tokenAudience) throw new UnauthorizedError()
  const tenantId = String(claims.tenant_id ?? '')
  if (!tenantId) throw new UnauthorizedError('Access token missing tenant_id')

  const app = await resolveApplicationForChat(
    { tenantId, tokenAudience: req.tokenAudience },
    applicationSlug,
  )

  return createRequestContext({
    tenantId,
    applicationId: app.id,
    applicationSlug: app.slug,
    subjectId: claims.sub,
    correlationId: req.requestId,
    tokenAudience: req.tokenAudience,
    email: claims.email,
    permissions: (claims.permissions as string[] | undefined) ?? [],
  })
}

conversationsRouter.get('/:id', authenticate, async (req, res, next) => {
  try {
    const q = appQuerySchema.parse(req.query)
    const ctx = await buildContext(req, q.application_id)
    const conversation = await getConversationForSubject(ctx, req.params.id!)
    res.json({
      id: conversation.id,
      status: conversation.status,
      created_at: conversation.createdAt,
      application_id: ctx.applicationSlug,
      request_id: req.requestId,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      next(new AppError(400, 'validation_error', 'Invalid query', err.flatten()))
      return
    }
    next(err)
  }
})

conversationsRouter.get('/:id/messages', authenticate, async (req, res, next) => {
  try {
    const q = appQuerySchema.parse(req.query)
    const ctx = await buildContext(req, q.application_id)
    const rows = await listMessages(ctx, req.params.id!)
    res.json({
      conversation_id: req.params.id,
      messages: rows.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        metadata: m.metadataJson,
        created_at: m.createdAt,
      })),
      request_id: req.requestId,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      next(new AppError(400, 'validation_error', 'Invalid query', err.flatten()))
      return
    }
    next(err)
  }
})

import { Router } from 'express'
import { z } from 'zod'

import { AppError, UnauthorizedError } from '../../core/errors.js'
import { createRequestContext } from '../../core/requestContext.js'
import { createDefaultModelGateway } from '../../llm/gateway.js'
import { ChatService } from '../../orchestration/chatService.js'
import { resolveApplicationForChat } from '../../registry/applications.js'
import { authenticate } from '../middleware/authenticate.js'

const chatRequestSchema = z.object({
  application_id: z.string().min(1).max(64),
  conversation_id: z.string().uuid().nullable().optional(),
  message: z.string().min(1).max(12_000),
})

const gateway = createDefaultModelGateway()
const chatService = new ChatService(gateway)

export const chatRouter = Router()

chatRouter.post('/messages', authenticate, async (req, res, next) => {
  try {
    const body = chatRequestSchema.parse(req.body)
    const claims = req.authClaims
    if (!claims?.sub || !req.tokenAudience) {
      throw new UnauthorizedError()
    }

    const tenantId = String(claims.tenant_id ?? '')
    if (!tenantId) {
      throw new UnauthorizedError('Access token missing tenant_id')
    }

    const app = await resolveApplicationForChat(
      { tenantId, tokenAudience: req.tokenAudience },
      body.application_id,
    )

    const ctx = createRequestContext({
      tenantId,
      applicationId: app.id,
      applicationSlug: app.slug,
      subjectId: claims.sub,
      correlationId: req.requestId,
      tokenAudience: req.tokenAudience,
      email: claims.email,
      permissions: (claims.permissions as string[] | undefined) ?? [],
    })

    const result = await chatService.handle({
      ctx,
      app,
      conversationId: body.conversation_id,
      message: body.message,
    })

    res.json({
      conversation_id: result.conversationId,
      answer: result.answer,
      sources: result.sources,
      actions: [],
      request_id: result.requestId,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      next(new AppError(400, 'validation_error', 'Invalid request body', err.flatten()))
      return
    }
    next(err)
  }
})

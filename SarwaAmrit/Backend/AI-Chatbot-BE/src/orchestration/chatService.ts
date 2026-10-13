import type { RequestContext } from '../core/requestContext.js'
import { env } from '../config/env.js'
import type { ModelGateway, ModelRoute } from '../llm/gateway.js'
import { isModelRoute } from '../llm/gateway.js'
import { recordAuditEvent } from '../observability/audit.js'
import {
  appendMessage,
  getOrCreateConversation,
  listMessages,
} from '../persistence/repositories/conversations.js'
import type { RegisteredApplication } from '../registry/applications.js'

export type ChatResult = {
  conversationId: string
  answer: string
  sources: Record<string, unknown>[]
  requestId: string
}

function systemPrompt(app: RegisteredApplication): string {
  const agent = app.activeConfig.agent_config as { system_instructions?: string } | undefined
  const instructions =
    agent?.system_instructions ??
    `You are the ${app.name} assistant. Answer only questions within this application's scope.`
  return instructions
}

type ModelPolicy = {
  route?: string
  fallback_route?: string
}

function resolveModelRoute(app: RegisteredApplication): ModelRoute {
  const policy = app.activeConfig.model_policy as ModelPolicy | undefined
  const configured = policy?.route ?? env.DEFAULT_MODEL_ROUTE
  if (isModelRoute(configured)) {
    return configured
  }
  return 'mock'
}

function resolveFallbackRoute(app: RegisteredApplication, primary: ModelRoute): ModelRoute | null {
  const policy = app.activeConfig.model_policy as ModelPolicy | undefined
  const fallback = policy?.fallback_route ?? 'mock'
  if (!isModelRoute(fallback) || fallback === primary) {
    return null
  }
  return fallback
}

export class ChatService {
  constructor(private readonly gateway: ModelGateway) {}

  async handle(input: {
    ctx: RequestContext
    app: RegisteredApplication
    conversationId: string | null | undefined
    message: string
  }): Promise<ChatResult> {
    const conversation = await getOrCreateConversation(input.ctx, input.conversationId)

    await appendMessage({
      ctx: input.ctx,
      conversationId: conversation.id,
      role: 'user',
      content: input.message,
    })

    const history = await listMessages(input.ctx, conversation.id)
    const llmMessages = history.map((m) => ({
      role: m.role as 'user' | 'assistant' | 'system' | 'tool',
      content: m.content,
    }))

    const route = resolveModelRoute(input.app)
    const fallback = resolveFallbackRoute(input.app, route)
    const generateInput = {
      systemPrompt: systemPrompt(input.app),
      messages: llmMessages,
    }

    let generated
    let modelRouteUsed = route
    try {
      generated = await this.gateway.generate(route, generateInput)
    } catch (err) {
      if (!fallback) {
        throw err
      }
      generated = await this.gateway.generate(fallback, generateInput)
      modelRouteUsed = fallback
    }

    await appendMessage({
      ctx: input.ctx,
      conversationId: conversation.id,
      role: 'assistant',
      content: generated.answer,
      metadata: { sources: generated.sources, model_route: modelRouteUsed },
    })

    await recordAuditEvent({
      tenantId: input.ctx.tenantId,
      applicationId: input.ctx.applicationId,
      actorId: input.ctx.subjectId,
      eventType: 'chat.message.completed',
      decision: 'allow',
      correlationId: input.ctx.correlationId,
      payload: {
        conversation_id: conversation.id,
        model_route: modelRouteUsed,
        source_count: generated.sources.length,
      },
    })

    return {
      conversationId: conversation.id,
      answer: generated.answer,
      sources: generated.sources,
      requestId: input.ctx.correlationId,
    }
  }
}

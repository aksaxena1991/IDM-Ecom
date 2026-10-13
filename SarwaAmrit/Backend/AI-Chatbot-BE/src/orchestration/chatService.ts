import type { RequestContext } from '../core/requestContext.js'
import type { ModelGateway, ModelRoute } from '../llm/gateway.js'
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

function resolveModelRoute(app: RegisteredApplication): ModelRoute {
  const policy = app.activeConfig.model_policy as { route?: string } | undefined
  const route = policy?.route ?? 'mock'
  if (route === 'cloud' || route === 'self_hosted') {
    return 'mock'
  }
  return 'mock'
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
    const generated = await this.gateway.generate(route, {
      systemPrompt: systemPrompt(input.app),
      messages: llmMessages,
    })

    await appendMessage({
      ctx: input.ctx,
      conversationId: conversation.id,
      role: 'assistant',
      content: generated.answer,
      metadata: { sources: generated.sources, model_route: route },
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
        model_route: route,
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

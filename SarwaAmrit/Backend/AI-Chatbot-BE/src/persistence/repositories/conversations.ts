import { and, asc, eq } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

import { ConversationNotFound } from '../../core/errors.js'
import type { RequestContext } from '../../core/requestContext.js'
import { db } from '../db.js'
import { conversations, messages } from '../schema/index.js'

export type ConversationRow = typeof conversations.$inferSelect
export type MessageRow = typeof messages.$inferSelect

export async function getConversationForSubject(
  ctx: RequestContext,
  conversationId: string,
): Promise<ConversationRow> {
  const rows = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.id, conversationId),
        eq(conversations.tenantId, ctx.tenantId),
        eq(conversations.applicationId, ctx.applicationId),
        eq(conversations.subjectId, ctx.subjectId),
      ),
    )
    .limit(1)

  const row = rows[0]
  if (!row) throw new ConversationNotFound()
  return row
}

export async function getOrCreateConversation(
  ctx: RequestContext,
  conversationId: string | null | undefined,
): Promise<ConversationRow> {
  if (conversationId) {
    return getConversationForSubject(ctx, conversationId)
  }

  const id = uuidv4()
  const inserted = await db
    .insert(conversations)
    .values({
      id,
      tenantId: ctx.tenantId,
      applicationId: ctx.applicationId,
      subjectId: ctx.subjectId,
      status: 'active',
    })
    .returning()

  return inserted[0]!
}

export async function listMessages(
  ctx: RequestContext,
  conversationId: string,
): Promise<MessageRow[]> {
  await getConversationForSubject(ctx, conversationId)
  return db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.conversationId, conversationId),
        eq(messages.tenantId, ctx.tenantId),
        eq(messages.applicationId, ctx.applicationId),
      ),
    )
    .orderBy(asc(messages.createdAt))
}

export async function appendMessage(input: {
  ctx: RequestContext
  conversationId: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  metadata?: Record<string, unknown>
}): Promise<MessageRow> {
  const inserted = await db
    .insert(messages)
    .values({
      tenantId: input.ctx.tenantId,
      applicationId: input.ctx.applicationId,
      conversationId: input.conversationId,
      role: input.role,
      content: input.content,
      metadataJson: input.metadata ?? {},
    })
    .returning()
  return inserted[0]!
}

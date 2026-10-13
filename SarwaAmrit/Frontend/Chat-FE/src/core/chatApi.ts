import { chatFetch } from './chatClient'
import { CHAT_API_BASE_URL, resolveServiceUrl } from './config'

export type ChatMessageResponse = {
  conversation_id: string
  answer: string
  sources: Record<string, unknown>[]
  actions: unknown[]
  request_id: string
}

export type CapabilitiesResponse = {
  application_id: string
  name: string
  features: {
    chat: boolean
    streaming: boolean
    tools: string[]
    knowledge: boolean
  }
  request_id: string
}

export type HistoryMessage = {
  id: string
  role: string
  content: string
  metadata: Record<string, unknown>
  created_at: string
}

export async function sendChatMessage(input: {
  applicationId: string
  message: string
  conversationId?: string | null
}): Promise<ChatMessageResponse> {
  const res = await chatFetch(`${CHAT_API_BASE_URL}/api/v1/chat/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      application_id: input.applicationId,
      conversation_id: input.conversationId ?? null,
      message: input.message,
    }),
  })
  return res.json()
}

export async function fetchCapabilities(slug: string): Promise<CapabilitiesResponse> {
  const res = await chatFetch(`${CHAT_API_BASE_URL}/api/v1/applications/${slug}/capabilities`)
  return res.json()
}

export async function fetchConversationHistory(
  conversationId: string,
  applicationId: string,
): Promise<HistoryMessage[]> {
  const url = resolveServiceUrl(
    CHAT_API_BASE_URL,
    `/api/v1/conversations/${conversationId}/messages`,
  )
  url.searchParams.set('application_id', applicationId)
  const res = await chatFetch(url)
  const body = (await res.json()) as { messages: HistoryMessage[] }
  return body.messages
}

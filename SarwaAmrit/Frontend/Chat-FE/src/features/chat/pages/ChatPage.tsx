import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Button, Card, Chip, Input, Loader, NotificationBar, Typography } from '@thoughtstream/ui'
import { Send } from 'lucide-react'
import { getAccessToken } from '../../../core/api'
import {
  fetchCapabilities,
  fetchConversationHistory,
  sendChatMessage,
  type CapabilitiesResponse,
} from '../../../core/chatApi'
import { getActiveApplicationSlug, getApplicationLabel } from '../../../core/chatProfile'
import { readSession, SESSION_KEY } from '../../../core/session'

type UiMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function ChatPage() {
  const session = readSession()
  if (!session || !sessionStorage.getItem(SESSION_KEY)) {
    return <Navigate to="/login" replace />
  }

  const applicationSlug = getActiveApplicationSlug()
  const applicationLabel = getApplicationLabel()
  const accessToken = getAccessToken()

  const [capabilities, setCapabilities] = useState<CapabilitiesResponse | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<UiMessage[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [booting, setBooting] = useState(true)

  const listRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

  useEffect(() => {
    if (!accessToken) {
      setError('Session expired. Please sign in again.')
      setBooting(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const caps = await fetchCapabilities(accessToken, applicationSlug)
        if (!cancelled) setCapabilities(caps)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load assistant capabilities')
        }
      } finally {
        if (!cancelled) setBooting(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [accessToken, applicationSlug])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSend = async (event?: React.FormEvent) => {
    event?.preventDefault()
    const text = draft.trim()
    if (!text || !accessToken || sending) return

    setSending(true)
    setError(null)
    const optimisticId = crypto.randomUUID()
    setMessages((prev) => [...prev, { id: optimisticId, role: 'user', content: text }])
    setDraft('')

    try {
      const result = await sendChatMessage(accessToken, {
        applicationId: applicationSlug,
        message: text,
        conversationId,
      })
      setConversationId(result.conversation_id)
      setMessages((prev) => [
        ...prev,
        { id: result.request_id, role: 'assistant', content: result.answer },
      ])

      if (conversationId !== result.conversation_id) {
        const history = await fetchConversationHistory(
          accessToken,
          result.conversation_id,
          applicationSlug,
        )
        setMessages(
          history
            .filter((m) => m.role === 'user' || m.role === 'assistant')
            .map((m) => ({
              id: m.id,
              role: m.role as 'user' | 'assistant',
              content: m.content,
            })),
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Message failed')
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
      setDraft(text)
    } finally {
      setSending(false)
    }
  }

  if (booting) {
    return (
      <div className="chat-loading">
        <Loader size="lg" label="Loading assistant" centered />
      </div>
    )
  }

  return (
    <div className="chat-page">
      {error ? (
        <NotificationBar
          variant="error"
          title="Request failed"
          description={error}
          dismissible
          onDismiss={() => setError(null)}
        />
      ) : null}

      <Card className="chat-intro" padding="medium">
        <Typography variant="subhead" as="h2">
          {capabilities?.name ?? applicationLabel}
        </Typography>
        <Typography variant="bodySmall" color="secondary">
          Signed in as {session.name || session.email}. Questions stay scoped to{' '}
          <span className="mono">{applicationSlug}</span>.
        </Typography>
        {capabilities?.features.tools.length ? (
          <div className="chat-chips">
            {capabilities.features.tools.map((tool) => (
              <Chip key={tool} variant="status">
                {tool}
              </Chip>
            ))}
          </div>
        ) : null}
      </Card>

      <div className="chat-thread" ref={listRef} role="log" aria-live="polite">
        {messages.length === 0 ? (
          <Typography variant="body" color="secondary" className="chat-empty">
            Ask about policies, access, or workflows for {applicationLabel}.
          </Typography>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`chat-bubble chat-bubble--${m.role}`}>
              <Typography variant="caption" color="secondary" className="chat-bubble-role">
                {m.role === 'user' ? 'You' : 'Assistant'}
              </Typography>
              <Typography variant="body" as="p" className="chat-bubble-text">
                {m.content}
              </Typography>
            </div>
          ))
        )}
        {sending ? (
          <div className="chat-bubble chat-bubble--assistant">
            <Loader size="sm" label="Thinking" />
          </div>
        ) : null}
      </div>

      <form className="chat-composer" onSubmit={handleSend}>
        <Input
          label="Message"
          placeholder="Type your question…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={sending || !accessToken}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              void handleSend()
            }
          }}
        />
        <Button
          type="submit"
          variant="primary"
          disabled={sending || !draft.trim() || !accessToken}
          aria-label="Send message"
        >
          <Send size={18} aria-hidden />
          Send
        </Button>
      </form>
    </div>
  )
}

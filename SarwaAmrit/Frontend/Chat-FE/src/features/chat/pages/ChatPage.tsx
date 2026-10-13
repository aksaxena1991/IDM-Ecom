import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Card, Chip, Input, Loader, NotificationBar, Typography } from '@thoughtstream/ui'
import { Send } from 'lucide-react'
import {
  fetchCapabilities,
  fetchConversationHistory,
  sendChatMessage,
  type CapabilitiesResponse,
} from '../../../core/chatApi'
import { resolveChatProfile } from '../../../core/chatProfile'
import { useAuth } from '../../auth/context/AuthContext'

type UiMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function ChatPage() {
  const { accessToken, applicationSlug, user } = useAuth()
  const profile = resolveChatProfile(applicationSlug)

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
    if (!accessToken) return
    let cancelled = false
    ;(async () => {
      try {
        const caps = await fetchCapabilities(accessToken, profile.slug)
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
  }, [accessToken, profile.slug])

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
        applicationId: profile.slug,
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
          profile.slug,
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
          {capabilities?.name ?? profile.label}
        </Typography>
        <Typography variant="bodySmall" color="secondary">
          Signed in as {user?.name || user?.email}. Questions stay scoped to{' '}
          <span className="mono">{profile.slug}</span> via your SSO access token.
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
            Ask about policies, access, or workflows for {profile.label}.
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
          disabled={sending}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              void handleSend()
            }
          }}
        />
        <Button type="submit" variant="primary" disabled={sending || !draft.trim()} aria-label="Send message">
          <Send size={18} aria-hidden />
          Send
        </Button>
      </form>
    </div>
  )
}

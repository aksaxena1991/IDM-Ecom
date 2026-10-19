import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Loader, NotificationBar } from '@thoughtstream/ui'
import { CheckCheck, Send, Smile } from 'lucide-react'
import { ApiError } from '../../../core/api'
import {
  fetchCapabilities,
  fetchConversationHistory,
  sendChatMessage,
} from '../../../core/chatApi'
import { getActiveApplicationSlug, getApplicationLabel } from '../../../core/chatProfile'
import {
  readSession,
  readStoredConversationId,
  SESSION_KEY,
  writeStoredConversationId,
} from '../../../core/session'

type UiMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  sentAt: number
}

function formatMessageTime(epochMs: number): string {
  return new Date(epochMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function ChatPage() {
  const session = readSession()
  if (!session || !sessionStorage.getItem(SESSION_KEY)) {
    return <Navigate to="/login" replace />
  }

  const applicationSlug = getActiveApplicationSlug()
  const applicationLabel = getApplicationLabel()

  const [conversationId, setConversationId] = useState<string | null>(() =>
    readStoredConversationId(applicationSlug),
  )
  const [messages, setMessages] = useState<UiMessage[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [booting, setBooting] = useState(true)

  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await fetchCapabilities(applicationSlug)

        const storedConversationId = readStoredConversationId(applicationSlug)
        if (storedConversationId && !cancelled) {
          const history = await fetchConversationHistory(storedConversationId, applicationSlug)
          if (!cancelled) {
            setConversationId(storedConversationId)
            setMessages(
              history
                .filter((m) => m.role === 'user' || m.role === 'assistant')
                .map((m) => ({
                  id: m.id,
                  role: m.role as 'user' | 'assistant',
                  content: m.content,
                  sentAt: m.created_at ? Date.parse(m.created_at) : Date.now(),
                })),
            )
          }
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError && err.status === 401) {
            setError('Session expired. Please sign in again.')
          } else {
            setError(err instanceof Error ? err.message : 'Could not load assistant capabilities')
          }
        }
      } finally {
        if (!cancelled) setBooting(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [applicationSlug])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSend = async (event?: React.FormEvent) => {
    event?.preventDefault()
    const text = draft.trim()
    if (!text || sending) return

    setSending(true)
    setError(null)
    const optimisticId = crypto.randomUUID()
    const sentAt = Date.now()
    setMessages((prev) => [...prev, { id: optimisticId, role: 'user', content: text, sentAt }])
    setDraft('')
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }

    try {
      const result = await sendChatMessage({
        applicationId: applicationSlug,
        message: text,
        conversationId,
      })
      setConversationId(result.conversation_id)
      writeStoredConversationId(applicationSlug, result.conversation_id)
      setMessages((prev) => [
        ...prev,
        {
          id: result.request_id,
          role: 'assistant',
          content: result.answer,
          sentAt: Date.now(),
        },
      ])

      if (conversationId !== result.conversation_id) {
        const history = await fetchConversationHistory(result.conversation_id, applicationSlug)
        setMessages(
          history
            .filter((m) => m.role === 'user' || m.role === 'assistant')
            .map((m) => ({
              id: m.id,
              role: m.role as 'user' | 'assistant',
              content: m.content,
              sentAt: m.created_at ? Date.parse(m.created_at) : Date.now(),
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
    <div className="chat-page chat-page--messenger">
      {error ? (
        <div className="chat-alert">
          <NotificationBar
            variant="error"
            title="Request failed"
            description={error}
            dismissible
            onDismiss={() => setError(null)}
          />
        </div>
      ) : null}

      <div className="chat-thread-scroll">
        <div className="chat-thread" ref={listRef} role="log" aria-live="polite">
          {messages.length === 0 ? (
            <p className="chat-empty">
              Send a message to {applicationLabel}. Scope:{' '}
              <span className="mono">{applicationSlug}</span>
            </p>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`chat-row chat-row--${m.role === 'user' ? 'outgoing' : 'incoming'}`}
              >
                <div className={`chat-bubble chat-bubble--${m.role}`}>
                  <p className="chat-bubble-body">{m.content}</p>
                  <div className="chat-bubble-meta">
                    <time dateTime={new Date(m.sentAt).toISOString()}>
                      {formatMessageTime(m.sentAt)}
                    </time>
                    {m.role === 'user' ? (
                      <CheckCheck size={15} className="chat-bubble-ticks" aria-hidden />
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
          {sending ? (
            <div className="chat-row chat-row--incoming">
              <div className="chat-bubble chat-bubble--assistant chat-bubble--typing">
                <Loader size="sm" label="Thinking" />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <form className="chat-composer-bar" onSubmit={handleSend}>
        <div className="chat-composer-field">
          <Smile size={22} strokeWidth={1.5} className="chat-composer-leading" aria-hidden />
          <textarea
            ref={inputRef}
            className="chat-composer-input"
            placeholder="Type a message"
            value={draft}
            rows={1}
            disabled={sending}
            aria-label="Message"
            onChange={(e) => {
              setDraft(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void handleSend()
              }
            }}
          />
        </div>
        <button
          type="submit"
          className="chat-send-btn"
          disabled={sending || !draft.trim()}
          aria-label="Send message"
        >
          <Send size={20} strokeWidth={2} aria-hidden />
        </button>
      </form>
    </div>
  )
}

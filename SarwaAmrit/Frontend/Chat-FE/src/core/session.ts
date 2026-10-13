import type { UserInfo } from './api'

export const SESSION_KEY = 'chat-portal-session'

export type ChatSession = {
  email: string
  name?: string
  userId: string
  tenantId?: string
  applicationSlug: string
}

export function readSession(): ChatSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ChatSession
  } catch {
    return null
  }
}

export function writeSession(input: ChatSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(input))
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY)
}

export function sessionFromUserInfo(user: UserInfo, applicationSlug: string): ChatSession {
  return {
    email: user.email || '',
    name: user.name,
    userId: user.sub,
    tenantId: user.tenant_id,
    applicationSlug,
  }
}

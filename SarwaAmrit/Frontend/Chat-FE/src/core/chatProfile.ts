import {
  CHAT_PROFILES,
  CHAT_PROFILE_STORAGE_KEY,
  type ChatProfile,
} from './config'

export function getStoredProfileSlug(): string | null {
  try {
    return sessionStorage.getItem(CHAT_PROFILE_STORAGE_KEY)
  } catch {
    return null
  }
}

export function persistProfileSlug(slug: string): void {
  sessionStorage.setItem(CHAT_PROFILE_STORAGE_KEY, slug)
}

export function resolveChatProfile(slug?: string | null): ChatProfile {
  const key = slug ?? getStoredProfileSlug() ?? CHAT_PROFILES[0]!.slug
  const found = CHAT_PROFILES.find((p) => p.slug === key)
  if (!found) {
    throw new Error(`Unknown assistant profile: ${key}`)
  }
  return found
}

export function getActiveOidcClientId(): string {
  return resolveChatProfile().clientId
}

export function getActiveApplicationSlug(): string {
  return resolveChatProfile().slug
}

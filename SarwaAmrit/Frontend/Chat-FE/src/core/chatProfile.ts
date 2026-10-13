import { CHAT_APPLICATION_ID, CHAT_APPLICATION_LABEL } from './config'

export function getActiveApplicationSlug(): string {
  return CHAT_APPLICATION_ID
}

export function getApplicationLabel(): string {
  return CHAT_APPLICATION_LABEL
}

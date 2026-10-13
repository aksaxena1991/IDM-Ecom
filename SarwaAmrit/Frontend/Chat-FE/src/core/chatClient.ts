import { getValidAccessToken } from './api'
import { ApiError, parseProblemDetails } from './problemDetails'

/** Authenticated fetch to AI-Chatbot-BE (Bearer SSO access token). */
export async function chatFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const token = await getValidAccessToken()
  if (!token) {
    throw new ApiError(401, 'Unauthorized', 'Session expired. Please sign in again.')
  }

  const headers = new Headers(init.headers)
  if (!headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(input, { ...init, headers })
  if (res.status === 401) {
    throw new ApiError(401, 'Unauthorized', 'Session expired. Please sign in again.')
  }
  if (!res.ok) {
    throw await parseProblemDetails(res)
  }
  return res
}

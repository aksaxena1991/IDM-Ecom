export class ApiError extends Error {
  status: number
  detail?: string
  body?: Record<string, unknown>

  constructor(
    status: number,
    title: string,
    detail?: string,
    extras?: { body?: Record<string, unknown> },
  ) {
    super(detail || title)
    this.status = status
    this.detail = detail
    this.body = extras?.body
  }
}

export async function parseProblemDetails(res: Response): Promise<ApiError> {
  try {
    const body = await res.json()
    return new ApiError(res.status, body.title || res.statusText, body.detail || body.error_description, {
      body,
    })
  } catch {
    return new ApiError(res.status, res.statusText)
  }
}

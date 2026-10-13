export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ApplicationAccessDenied extends AppError {
  constructor(message = 'Application access denied') {
    super(403, 'application_access_denied', message)
  }
}

export class ConversationNotFound extends AppError {
  constructor(message = 'Conversation not found') {
    super(404, 'conversation_not_found', message)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, 'unauthorized', message)
  }
}

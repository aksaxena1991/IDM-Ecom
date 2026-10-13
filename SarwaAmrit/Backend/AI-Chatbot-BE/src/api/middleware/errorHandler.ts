import type { NextFunction, Request, Response } from 'express'

import { AppError } from '../../core/errors.js'

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const requestId = req.requestId ?? 'unknown'

  if (err instanceof AppError) {
    res.status(err.status).json({
      error: err.code,
      detail: err.message,
      request_id: requestId,
      ...(err.details !== undefined ? { details: err.details } : {}),
    })
    return
  }

  console.error(err)
  res.status(500).json({
    error: 'internal_error',
    detail: 'An unexpected error occurred',
    request_id: requestId,
  })
}

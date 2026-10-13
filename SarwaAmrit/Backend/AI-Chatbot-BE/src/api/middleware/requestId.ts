import type { NextFunction, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'

export const REQUEST_ID_HEADER = 'x-request-id'

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header(REQUEST_ID_HEADER)
  const id = incoming?.trim() || uuidv4()
  req.requestId = id
  res.setHeader(REQUEST_ID_HEADER, id)
  next()
}

declare global {
  namespace Express {
    interface Request {
      requestId: string
    }
  }
}

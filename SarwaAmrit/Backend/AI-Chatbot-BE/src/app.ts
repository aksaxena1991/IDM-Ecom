import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { pinoHttp } from 'pino-http'

import { v1Router } from './api/v1/index.js'
import { errorHandler } from './api/middleware/errorHandler.js'
import { requestIdMiddleware } from './api/middleware/requestId.js'
import { env } from './config/env.js'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(
    cors({
      origin: env.corsOrigins.length > 0 ? env.corsOrigins : true,
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '256kb' }))
  app.use(requestIdMiddleware)
  app.use(
    pinoHttp({
      level: env.LOG_LEVEL,
      redact: ['req.headers.authorization'],
    }),
  )

  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: env.CHAT_RATE_LIMIT_PER_MINUTE,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  )

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'ai-chatbot-platform' })
  })

  app.use('/api/v1', v1Router)
  app.use(errorHandler)

  return app
}

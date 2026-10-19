import cors from 'cors';
import express, { type Express } from 'express';

import { env } from './config/env.js';
import {
  createCircuitBreakerGuard,
} from './middleware/circuit-breaker-guard.js';
import { createTokenBucketRateLimiter } from './middleware/token-bucket-rate-limit.js';
import { mountImsBeProxy } from './routes/ims-be.proxy.js';
import { CircuitBreaker } from './resilience/circuit-breaker.js';

export function createGatewayApp(): Express {
  const app = express();

  app.set('trust proxy', 1);

  app.use(
    cors({
      origin: env.corsOrigins.length > 0 ? env.corsOrigins : true,
    }),
  );

  const breaker = new CircuitBreaker({
    failureThreshold: env.CIRCUIT_BREAKER_FAILURE_THRESHOLD,
    openDurationMs: env.CIRCUIT_BREAKER_OPEN_MS,
  });

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok', service: 'api-gateway' });
  });

  app.get('/readyz', (_req, res) => {
    const state = breaker.getState();
    if (state === 'open') {
      res.status(503).json({
        status: 'unavailable',
        service: 'api-gateway',
        imsBeCircuit: state,
      });
      return;
    }
    res.json({
      status: 'ok',
      service: 'api-gateway',
      imsBeCircuit: state,
      imsBeTarget: env.IMS_BE_URL,
    });
  });

  app.get('/gateway/status', (_req, res) => {
    res.json({
      imsBeTarget: env.IMS_BE_URL,
      circuit: breaker.getState(),
      rateLimit: {
        bucketCapacity: env.RATE_LIMIT_BUCKET_CAPACITY,
        refillPerSecond: env.RATE_LIMIT_REFILL_PER_SECOND,
      },
    });
  });

  const rateLimiter = createTokenBucketRateLimiter({
    capacity: env.RATE_LIMIT_BUCKET_CAPACITY,
    refillPerSecond: env.RATE_LIMIT_REFILL_PER_SECOND,
  });

  app.use('/api/v1', rateLimiter, createCircuitBreakerGuard(breaker));
  app.use('/api-docs', rateLimiter, createCircuitBreakerGuard(breaker));

  mountImsBeProxy(app, env.IMS_BE_URL, breaker);

  return app;
}

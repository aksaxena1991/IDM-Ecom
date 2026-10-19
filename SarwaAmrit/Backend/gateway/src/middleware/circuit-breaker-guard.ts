import type { NextFunction, Request, Response } from 'express';

import type { CircuitBreaker } from '../resilience/circuit-breaker.js';

export function createCircuitBreakerGuard(breaker: CircuitBreaker) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    if (!breaker.allowRequest()) {
      res.status(503).json({
        detail: 'IMS-BE is temporarily unavailable (circuit open).',
      });
      return;
    }
    next();
  };
}

export function trackUpstreamResponse(breaker: CircuitBreaker, res: Response): void {
  res.once('finish', () => {
    if (res.statusCode >= 500) {
      breaker.recordFailure();
      return;
    }
    breaker.recordSuccess();
  });
}

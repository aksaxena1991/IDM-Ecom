import type { Express, Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

import type { CircuitBreaker } from '../resilience/circuit-breaker.js';
import { trackUpstreamResponse } from '../middleware/circuit-breaker-guard.js';

export function mountImsBeProxy(
  app: Express,
  targetUrl: string,
  breaker: CircuitBreaker,
): void {
  const proxy = createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    on: {
      proxyReq: (_proxyReq, req: Request, res: Response) => {
        trackUpstreamResponse(breaker, res);
      },
      error: (error, _req, res) => {
        breaker.recordFailure();
        if (res && 'writeHead' in res && !res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              detail: 'Bad gateway — could not reach IMS-BE.',
              error: error.message,
            }),
          );
        }
      },
    },
  });

  app.use('/api/v1', proxy);
  app.use('/api-docs', proxy);
}

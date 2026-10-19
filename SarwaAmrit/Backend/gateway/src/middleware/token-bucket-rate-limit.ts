import type { NextFunction, Request, Response } from 'express';

import { TokenBucket, type TokenBucketOptions } from '../resilience/token-bucket.js';

export function createTokenBucketRateLimiter(options: TokenBucketOptions) {
  const buckets = new Map<string, TokenBucket>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip ?? 'anonymous';
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = new TokenBucket(options);
      buckets.set(key, bucket);
    }

    if (!bucket.tryConsume(1)) {
      res.status(429).json({
        detail: 'Rate limit exceeded. Try again shortly.',
      });
      return;
    }

    next();
  };
}

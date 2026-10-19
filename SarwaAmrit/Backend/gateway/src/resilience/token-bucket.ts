export type TokenBucketOptions = {
  capacity: number;
  refillPerSecond: number;
};

export class TokenBucket {
  private tokens: number;
  private lastRefillMs: number;

  constructor(private readonly options: TokenBucketOptions) {
    this.tokens = options.capacity;
    this.lastRefillMs = Date.now();
  }

  tryConsume(count = 1): boolean {
    this.refill();
    if (this.tokens < count) {
      return false;
    }
    this.tokens -= count;
    return true;
  }

  private refill(): void {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefillMs) / 1000;
    if (elapsedSeconds <= 0) {
      return;
    }
    const added = elapsedSeconds * this.options.refillPerSecond;
    this.tokens = Math.min(this.options.capacity, this.tokens + added);
    this.lastRefillMs = now;
  }
}

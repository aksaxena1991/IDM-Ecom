export type CircuitBreakerOptions = {
  failureThreshold: number;
  openDurationMs: number;
};

export type CircuitState = 'closed' | 'open' | 'half-open';

export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private consecutiveFailures = 0;
  private openedAtMs: number | null = null;

  constructor(private readonly options: CircuitBreakerOptions) {}

  getState(): CircuitState {
    this.maybeTransitionToHalfOpen();
    return this.state;
  }

  allowRequest(): boolean {
    this.maybeTransitionToHalfOpen();
    return this.state !== 'open';
  }

  recordSuccess(): void {
    this.consecutiveFailures = 0;
    this.state = 'closed';
    this.openedAtMs = null;
  }

  recordFailure(): void {
    if (this.state === 'half-open') {
      this.tripOpen();
      return;
    }

    this.consecutiveFailures += 1;
    if (this.consecutiveFailures >= this.options.failureThreshold) {
      this.tripOpen();
    }
  }

  private tripOpen(): void {
    this.state = 'open';
    this.openedAtMs = Date.now();
  }

  private maybeTransitionToHalfOpen(): void {
    if (this.state !== 'open' || this.openedAtMs === null) {
      return;
    }
    if (Date.now() - this.openedAtMs >= this.options.openDurationMs) {
      this.state = 'half-open';
    }
  }
}

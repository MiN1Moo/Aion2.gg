/** Minimum-interval rate limiter + retry with exponential backoff for temporary failures. */
export class RateLimiter {
  private next = 0;
  constructor(private perMinute: number) {}
  async wait() {
    const gap = 60_000 / this.perMinute;
    const now = Date.now();
    const at = Math.max(now, this.next);
    this.next = at + gap;
    if (at > now) await new Promise((r) => setTimeout(r, at - now));
  }
}

export async function withRetry<T>(fn: () => Promise<T>, tries = 4, baseMs = 500): Promise<T> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); } catch (e) {
      last = e;
      await new Promise((r) => setTimeout(r, baseMs * 2 ** i));
    }
  }
  throw last;
}

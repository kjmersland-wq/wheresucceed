/**
 * A small in-memory sliding-window limiter. It is per server instance, so on a
 * platform that runs several instances the real limit is higher than the number
 * set here; it is a brake on runaway use, not an exact meter. Swap for a shared
 * store when there is one.
 */
export function createRateLimiter(limit: number, windowMs: number, now: () => number = Date.now) {
  const hits = new Map<string, number[]>();

  return {
    /** Records a request for `key`. Returns false when the key is over its limit. */
    allow(key: string): boolean {
      const t = now();
      const recent = (hits.get(key) ?? []).filter((time) => t - time < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return false;
      }
      recent.push(t);
      hits.set(key, recent);
      // Keep the map from growing without bound.
      if (hits.size > 5000) {
        for (const [k, times] of hits)
          if (times.every((time) => t - time >= windowMs)) hits.delete(k);
      }
      return true;
    },
  };
}

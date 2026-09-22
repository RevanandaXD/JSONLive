import { NextResponse } from "next/server";

export class RateLimitExceeded extends Error {
  retryAfter: number;

  constructor(retryAfter: number) {
    super("Too many requests. Please slow down.");
    this.name = "RateLimitExceeded";
    this.retryAfter = retryAfter;
  }
}

const store = new Map<string, { timestamps: number[]; windowMS: number }>();
let counter = 0;

export function RateLimit(
  key: string,
  limit: number,
  windowMs: number,
): void {
  const now = Date.now();

  const bucket = store.get(key);
  if (!bucket || bucket.timestamps.length === 0) {
    store.set(key, { timestamps: [now], windowMS: windowMs });
    maybeSweep();
    return;
  }

  bucket.timestamps = bucket.timestamps.filter(
    t => now - t < bucket.windowMS,
  )

  if (bucket.timestamps.length >= limit) {
    const retryAfter = Math.ceil((bucket.timestamps[0] + bucket.windowMS - now) / 1000)
    throw new RateLimitExceeded(retryAfter);
  }

  bucket.timestamps.push(now);
  maybeSweep()
}

function maybeSweep() {
    counter += 1;
    if (counter % 100 !== 0) return;
    for (const [key, bucket] of store) {
        if (bucket.timestamps.length === 0) store.delete(key)
    }
}

export function clientIp(request: Request): string {
  const cf = request.headers.get("cf-connecting-ip"); // Cloudflare Tunnel
  if (cf) return cf;
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function rateLimitError(
  retryAfter: number,
  extraHeaders: Record<string, string> = {},
) {
  return NextResponse.json(
    { error: "Too Many Requests", retryAfter },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfter), ...extraHeaders },
    },
  );
}

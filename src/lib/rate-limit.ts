import { NextResponse } from "next/server";

export class RateLimitExceeded extends Error {
  retryAfter: number;

  constructor(retryAfter: number) {
    super("Too many requests. Please slow down.");
    this.name = "RateLimitExceeded";
    this.retryAfter = retryAfter;
  }
}

const MAX_KEYS = 10_000;

const store = new Map<
  string,
  { timestamps: number[]; windowMs: number; lastSeen: number }
>();
let counter = 0;

export function RateLimit(
  key: string,
  limit: number,
  windowMs: number,
): void {
  const now = Date.now();

  let bucket = store.get(key);
  if (!bucket) {
    if (store.size >= MAX_KEYS) evictOldest();
    bucket = { timestamps: [], windowMs, lastSeen: now };
    store.set(key, bucket);
  }

  bucket.lastSeen = now;
  bucket.timestamps = bucket.timestamps.filter(
    t => now - t < bucket.windowMs,
  );

  if (bucket.timestamps.length >= limit) {
    const retryAfter = Math.ceil(
      (bucket.timestamps[0] + bucket.windowMs - now) / 1000,
    );
    throw new RateLimitExceeded(retryAfter);
  }

  bucket.timestamps.push(now);
  maybeSweep(now);
}

function maybeSweep(now: number) {
  counter += 1;
  if (counter % 100 !== 0) return;
  for (const [key, bucket] of store) {
    if (now - bucket.lastSeen > bucket.windowMs) store.delete(key);
  }
}

function evictOldest() {
  let oldestKey: string | null = null;
  let oldestSeen = Infinity;
  for (const [key, bucket] of store) {
    if (bucket.lastSeen < oldestSeen) {
      oldestSeen = bucket.lastSeen;
      oldestKey = key;
    }
  }
  if (oldestKey !== null) store.delete(oldestKey);
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

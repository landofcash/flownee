import { createHash } from "node:crypto";

type RateLimitBucket = {
  count: number;
  windowStartedAt: number;
};

type RateLimitScope = "plan" | "transcribe";

export type RateLimitDecision = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
};

declare global {
  var __flowneeRateLimitBuckets: Map<string, RateLimitBucket> | undefined;
}

const buckets =
  globalThis.__flowneeRateLimitBuckets ??
  (globalThis.__flowneeRateLimitBuckets = new Map<string, RateLimitBucket>());

const DEFAULT_WINDOW_SECONDS = 10 * 60;
const DEFAULT_LIMITS: Record<RateLimitScope, number> = {
  transcribe: 6,
  plan: 20,
};

function boundedInteger(value: string | undefined, fallback: number, maximum: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= maximum
    ? parsed
    : fallback;
}

function stableIdentityHash(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 24);
}

export function requestClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",", 1)[0]?.trim();
  const address =
    request.headers.get("x-nf-client-connection-ip")?.trim() ||
    forwarded ||
    "unknown-client";
  const agent = request.headers.get("user-agent")?.slice(0, 160) ?? "unknown-agent";
  return stableIdentityHash(`${address}|${agent}`);
}

export function rateLimitConfiguration(scope: RateLimitScope): {
  limit: number;
  windowMs: number;
} {
  const envName =
    scope === "transcribe" ? "AI_TRANSCRIBE_RATE_LIMIT" : "AI_PLAN_RATE_LIMIT";
  return {
    limit: boundedInteger(process.env[envName], DEFAULT_LIMITS[scope], 1_000),
    windowMs:
      boundedInteger(
        process.env.AI_RATE_LIMIT_WINDOW_SECONDS,
        DEFAULT_WINDOW_SECONDS,
        24 * 60 * 60,
      ) * 1_000,
  };
}

export function consumeRequestLimit({
  scope,
  clientKey,
  limit,
  windowMs,
  now = Date.now(),
}: {
  scope: RateLimitScope;
  clientKey: string;
  limit: number;
  windowMs: number;
  now?: number;
}): RateLimitDecision {
  const key = `${scope}:${clientKey}`;
  const current = buckets.get(key);
  const bucket =
    !current || now - current.windowStartedAt >= windowMs
      ? { count: 0, windowStartedAt: now }
      : current;

  if (bucket.count >= limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((bucket.windowStartedAt + windowMs - now) / 1_000),
    );
    return { allowed: false, limit, remaining: 0, retryAfterSeconds };
  }

  bucket.count += 1;
  buckets.set(key, bucket);
  if (buckets.size > 2_000) {
    for (const [bucketKey, candidate] of buckets) {
      if (now - candidate.windowStartedAt >= windowMs) buckets.delete(bucketKey);
    }
  }

  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - bucket.count),
    retryAfterSeconds: 0,
  };
}

export function rateLimitHeaders(decision: RateLimitDecision): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(decision.limit),
    "X-RateLimit-Remaining": String(decision.remaining),
    ...(decision.retryAfterSeconds > 0
      ? { "Retry-After": String(decision.retryAfterSeconds) }
      : {}),
  };
}

export function resetRequestLimitsForTests(): void {
  buckets.clear();
}

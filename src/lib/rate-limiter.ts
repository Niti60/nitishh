/**
 * Shared / Distributed Rate Limiter
 *
 * Implements a sliding-window rate limit suitable for both production
 * (Upstash Redis REST) and local development (in-memory sliding window).
 *
 * Limits: maximum 5 submissions per IP within 15 minutes (900 seconds).
 */

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number; // Unix timestamp in ms
  isProductionBackend: boolean;
  backendName: "Upstash Redis (Distributed Production)" | "In-Memory (Development Fallback)";
}

export interface RateLimiterOptions {
  limit?: number; // default: 5
  windowMs?: number; // default: 15 * 60 * 1000 (15 minutes)
}

const DEFAULT_LIMIT = 5;
const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// In-memory fallback sliding window store
interface MemoryRecord {
  timestamps: number[];
}
const memoryStore = new Map<string, MemoryRecord>();

let hasLoggedBackendType = false;

function logBackendStatusOnce(isProd: boolean) {
  if (hasLoggedBackendType) return;
  hasLoggedBackendType = true;
  if (isProd) {
    console.log(
      "[RateLimiter] Configured with Upstash Redis (Distributed production mode active across serverless instances).",
    );
  } else {
    console.warn(
      "[RateLimiter] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not configured. Running with in-memory rate limiter fallback (development only — not shared across distributed serverless instances).",
    );
  }
}

// In-memory rate limiting implementation
function checkMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number,
): RateLimitResult {
  logBackendStatusOnce(false);

  let record = memoryStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    memoryStore.set(key, record);
  }

  // Remove timestamps outside current window
  const windowStart = now - windowMs;
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  const resetTime =
    record.timestamps.length > 0 ? record.timestamps[0]! + windowMs : now + windowMs;

  if (record.timestamps.length >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      resetTime,
      isProductionBackend: false,
      backendName: "In-Memory (Development Fallback)",
    };
  }

  // Register current hit
  record.timestamps.push(now);
  const remaining = Math.max(0, limit - record.timestamps.length);

  return {
    success: true,
    limit,
    remaining,
    resetTime,
    isProductionBackend: false,
    backendName: "In-Memory (Development Fallback)",
  };
}

// Upstash Redis REST sliding-window rate limit
async function checkUpstashRateLimit(
  url: string,
  token: string,
  key: string,
  limit: number,
  windowMs: number,
  now: number,
): Promise<RateLimitResult> {
  logBackendStatusOnce(true);

  const redisKey = `ratelimit:contact:${key}`;
  const windowSeconds = Math.ceil(windowMs / 1000);
  const clearBefore = now - windowMs;

  try {
    // Sliding window using Redis Sorted Set (ZSET)
    // Pipeline commands:
    // 1. ZREMRANGEBYSCORE key 0 clearBefore
    // 2. ZADD key now member
    // 3. ZCARD key
    // 4. EXPIRE key windowSeconds
    const member = `${now}:${Math.random().toString(36).substring(2, 9)}`;
    const pipelineUrl = `${url.replace(/\/$/, "")}/pipeline`;

    const response = await fetch(pipelineUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["ZREMRANGEBYSCORE", redisKey, "0", String(clearBefore)],
        ["ZADD", redisKey, String(now), member],
        ["ZCARD", redisKey],
        ["EXPIRE", redisKey, String(windowSeconds)],
      ]),
    });

    if (!response.ok) {
      throw new Error(`Upstash returned HTTP ${response.status}`);
    }

    const data = (await response.json()) as Array<{ result?: unknown; error?: string }>;
    // Result of ZCARD is at index 2
    const zcardResult = data[2]?.result;
    const currentCount = typeof zcardResult === "number" ? zcardResult : 1;
    const resetTime = now + windowMs;

    if (currentCount > limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        resetTime,
        isProductionBackend: true,
        backendName: "Upstash Redis (Distributed Production)",
      };
    }

    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - currentCount),
      resetTime,
      isProductionBackend: true,
      backendName: "Upstash Redis (Distributed Production)",
    };
  } catch (error) {
    console.error(
      "[RateLimiter] Upstash Redis request failed, falling back to local memory limiter:",
      error instanceof Error ? error.message : error,
    );
    return checkMemoryRateLimit(key, limit, windowMs, now);
  }
}

/**
 * Check whether a request from the given identifier (e.g. client IP) is permitted.
 */
export async function checkRateLimit(
  identifier: string,
  options?: RateLimiterOptions,
): Promise<RateLimitResult> {
  const limit = options?.limit ?? DEFAULT_LIMIT;
  const windowMs = options?.windowMs ?? DEFAULT_WINDOW_MS;
  const now = Date.now();

  const upstashUrl = process.env["UPSTASH_REDIS_REST_URL"]?.trim();
  const upstashToken = process.env["UPSTASH_REDIS_REST_TOKEN"]?.trim();

  if (upstashUrl && upstashToken) {
    return checkUpstashRateLimit(upstashUrl, upstashToken, identifier, limit, windowMs, now);
  }

  return checkMemoryRateLimit(identifier, limit, windowMs, now);
}

/**
 * Helper to reset in-memory rate limiting store (used for automated tests).
 */
export function resetMemoryRateLimiter(key?: string) {
  if (key) {
    memoryStore.delete(key);
  } else {
    memoryStore.clear();
  }
}

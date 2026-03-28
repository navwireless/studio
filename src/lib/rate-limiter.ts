// src/lib/rate-limiter.ts

interface RateLimitEntry {
    timestamps: number[];
}

interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: Date;
    retryAfterMs: number;
}

class RateLimiter {
    private store: Map<string, RateLimitEntry> = new Map();
    private cleanupInterval: ReturnType<typeof setInterval> | null = null;

    constructor() {
        // Auto-cleanup every 60 seconds to prevent memory leaks
        if (typeof setInterval !== "undefined") {
            this.cleanupInterval = setInterval(() => {
                this.cleanup();
            }, 60_000);
        }
    }

    /**
     * Check if a request is allowed under the given rate limit.
     * @param identifier - Unique identifier (userId, IP, etc.)
     * @param maxRequests - Maximum number of requests allowed in the window
     * @param windowMs - Time window in milliseconds
     */
    check(
        identifier: string,
        maxRequests: number,
        windowMs: number
    ): RateLimitResult {
        const now = Date.now();
        const windowStart = now - windowMs;

        let entry = this.store.get(identifier);

        if (!entry) {
            entry = { timestamps: [] };
            this.store.set(identifier, entry);
        }

        // Remove timestamps outside the current window
        entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

        const remaining = Math.max(0, maxRequests - entry.timestamps.length);
        const oldestInWindow = entry.timestamps[0] || now;
        const resetAt = new Date(oldestInWindow + windowMs);

        if (entry.timestamps.length >= maxRequests) {
            const retryAfterMs = oldestInWindow + windowMs - now;
            return {
                allowed: false,
                remaining: 0,
                resetAt,
                retryAfterMs: Math.max(0, retryAfterMs),
            };
        }

        // Allow the request and record the timestamp
        entry.timestamps.push(now);

        return {
            allowed: true,
            remaining: remaining - 1,
            resetAt,
            retryAfterMs: 0,
        };
    }

    /**
     * Remove all expired entries from the store
     */
    private cleanup() {
        const now = Date.now();
        // Use a generous 5-minute window for cleanup
        const maxAge = 5 * 60 * 1000;

        for (const [key, entry] of this.store.entries()) {
            entry.timestamps = entry.timestamps.filter(
                (ts) => now - ts < maxAge
            );
            if (entry.timestamps.length === 0) {
                this.store.delete(key);
            }
        }
    }

    /**
     * Get current store size (for monitoring)
     */
    get size(): number {
        return this.store.size;
    }

    /**
     * Destroy the limiter and clear the cleanup interval
     */
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.store.clear();
    }
}

// Singleton instance — persists across requests in the same serverless function instance
const globalRateLimiter = new RateLimiter();

/**
 * Rate limit configurations for different routes
 */
export const RATE_LIMITS = {
    analysis: { maxRequests: 20, windowMs: 60_000 }, // 20 per minute
    createOrder: { maxRequests: 5, windowMs: 60_000 }, // 5 per minute
    verifyPayment: { maxRequests: 10, windowMs: 60_000 }, // 10 per minute
    authRefresh: { maxRequests: 30, windowMs: 60_000 }, // 30 per minute
} as const;

/**
 * Check rate limit for a given identifier and route type
 */
export function checkRateLimit(
    identifier: string,
    routeType: keyof typeof RATE_LIMITS
): RateLimitResult {
    const config = RATE_LIMITS[routeType];
    const key = `${routeType}:${identifier}`;
    return globalRateLimiter.check(key, config.maxRequests, config.windowMs);
}

/**
 * Create a 429 Too Many Requests response
 */
export function rateLimitResponse(result: RateLimitResult): Response {
    const retryAfterSeconds = Math.ceil(result.retryAfterMs / 1000);

    return new Response(
        JSON.stringify({
            error: "Too many requests. Please slow down and try again.",
            retryAfterSeconds,
            resetAt: result.resetAt.toISOString(),
        }),
        {
            status: 429,
            headers: {
                "Content-Type": "application/json",
                "Retry-After": String(retryAfterSeconds),
                "X-RateLimit-Remaining": String(result.remaining),
                "X-RateLimit-Reset": result.resetAt.toISOString(),
            },
        }
    );
}

export default globalRateLimiter;
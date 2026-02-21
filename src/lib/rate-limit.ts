/**
 * Simple in-memory rate limiter for API routes
 * Uses a sliding window approach with automatic cleanup
 *
 * Note: In production with multiple Vercel serverless instances,
 * each instance has its own memory. For stricter rate limiting,
 * use Redis (e.g., Upstash). This provides basic protection.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000)

interface RateLimitOptions {
  /** Maximum number of requests allowed in the window */
  limit: number
  /** Window duration in seconds */
  windowSeconds: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

/**
 * Check if a request should be rate limited
 * @param key - Unique identifier (e.g., IP address or email)
 * @param options - Rate limit configuration
 */
export function rateLimit(
  key: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now()
  const windowMs = options.windowSeconds * 1000
  const existing = store.get(key)

  // No existing entry or window expired → allow
  if (!existing || now > existing.resetAt) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    })
    return {
      success: true,
      remaining: options.limit - 1,
      resetAt: now + windowMs,
    }
  }

  // Within window — check count
  if (existing.count >= options.limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: existing.resetAt,
    }
  }

  // Increment
  existing.count++
  return {
    success: true,
    remaining: options.limit - existing.count,
    resetAt: existing.resetAt,
  }
}

/**
 * Get the client IP from a request
 * Works with Vercel's x-forwarded-for header
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || 'unknown'
}

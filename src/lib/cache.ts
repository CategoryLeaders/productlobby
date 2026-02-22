/**
 * In-memory cache utility with TTL support
 * - Simple Map-based cache
 * - TTL (time-to-live) support
 * - LRU eviction when max size exceeded
 * - Functions: cacheGet, cacheSet, cacheDelete, cacheInvalidatePrefix
 */

interface CacheEntry<T> {
  value: T
  expiresAt: number
  lastAccessed: number
}

interface CacheStats {
  size: number
  maxSize: number
  hits: number
  misses: number
}

const DEFAULT_TTL_SECONDS = 60
const MAX_CACHE_SIZE = 1000

class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private hits = 0
  private misses = 0

  /**
   * Get a value from cache
   * Returns null if not found or expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      this.misses++
      return null
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      this.misses++
      return null
    }

    // Update last accessed time
    entry.lastAccessed = Date.now()
    this.hits++

    return entry.value as T
  }

  /**
   * Set a value in cache with optional TTL
   * TTL in seconds, defaults to 60 seconds
   */
  set<T>(key: string, value: T, ttlSeconds: number = DEFAULT_TTL_SECONDS): void {
    // Enforce max cache size with LRU eviction
    if (this.cache.size >= MAX_CACHE_SIZE) {
      this.evictLRU()
    }

    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
      lastAccessed: Date.now(),
    }

    this.cache.set(key, entry)
  }

  /**
   * Delete a specific key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Invalidate all cache entries with a given prefix
   * Useful for clearing related cached data (e.g., all campaign caches)
   */
  invalidatePrefix(prefix: string): number {
    let count = 0
    const keysToDelete: string[] = []

    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key)
        count++
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key)
    }

    return count
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
    this.hits = 0
    this.misses = 0
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return {
      size: this.cache.size,
      maxSize: MAX_CACHE_SIZE,
      hits: this.hits,
      misses: this.misses,
    }
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let lruKey: string | null = null
    let lruTime = Infinity

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed
        lruKey = key
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey)
    }
  }

  /**
   * Clean up expired entries (optional maintenance)
   * Call periodically to free up memory
   */
  cleanupExpired(): number {
    let count = 0
    const keysToDelete: string[] = []
    const now = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key)
        count++
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key)
    }

    return count
  }
}

// Global cache instance (per-instance cache, safe for serverless)
const cacheManager = new CacheManager()

/**
 * Get a value from cache
 */
export function cacheGet<T>(key: string): T | null {
  return cacheManager.get<T>(key)
}

/**
 * Set a value in cache with optional TTL
 */
export function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number = DEFAULT_TTL_SECONDS
): void {
  cacheManager.set(key, value, ttlSeconds)
}

/**
 * Delete a specific key from cache
 */
export function cacheDelete(key: string): boolean {
  return cacheManager.delete(key)
}

/**
 * Invalidate all cache entries with a given prefix
 */
export function cacheInvalidatePrefix(prefix: string): number {
  return cacheManager.invalidatePrefix(prefix)
}

/**
 * Clear all cache
 */
export function cacheClear(): void {
  cacheManager.clear()
}

/**
 * Get cache statistics
 */
export function cacheGetStats(): CacheStats {
  return cacheManager.getStats()
}

/**
 * Clean up expired entries
 */
export function cacheCleanupExpired(): number {
  return cacheManager.cleanupExpired()
}

/**
 * Helper function to generate cache keys with prefix
 */
export function generateCacheKey(prefix: string, id: string): string {
  return `${prefix}:${id}`
}

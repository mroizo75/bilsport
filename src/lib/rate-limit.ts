import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Fallback in-memory rate limiter (for development)
class InMemoryRateLimit {
  private requests: Map<string, { count: number; reset: number }> = new Map()

  async limit(identifier: string): Promise<{
    success: boolean
    limit: number
    remaining: number
    reset: number
  }> {
    const now = Date.now()
    const windowSize = 24 * 60 * 60 * 1000 // 24 timer
    const maxRequests = 10

    const current = this.requests.get(identifier)
    if (!current || current.reset < now) {
      this.requests.set(identifier, {
        count: 1,
        reset: now + windowSize
      })
      return { success: true, limit: maxRequests, remaining: maxRequests - 1, reset: now + windowSize }
    }

    if (current.count >= maxRequests) {
      return { success: false, limit: maxRequests, remaining: 0, reset: current.reset }
    }

    current.count++
    return { 
      success: true, 
      limit: maxRequests, 
      remaining: maxRequests - current.count,
      reset: current.reset 
    }
  }
}

// Redis-basert rate limiter (for produksjon)
function createRedisRateLimiter() {
  try {
    const upstashRedisRestUrl = process.env.UPSTASH_REDIS_REST_URL
    const upstashRedisRestToken = process.env.UPSTASH_REDIS_REST_TOKEN

    if (!upstashRedisRestUrl || !upstashRedisRestToken) {
      console.log('Redis credentials not found, using in-memory rate limiter')
      return null
    }

    const redis = new Redis({
      url: upstashRedisRestUrl,
      token: upstashRedisRestToken,
    })

    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "24 h"), // 10 requests per 24 timer
      analytics: true,
      prefix: "@upstash/ratelimit",
    })
  } catch (error) {
    console.error('Failed to create Redis rate limiter:', error)
    return null
  }
}

// Hybrid rate limiter - bruker Redis hvis tilgjengelig, ellers in-memory
const redisLimiter = createRedisRateLimiter()
const memoryLimiter = new InMemoryRateLimit()

export const rateLimiter = {
  limit: async (identifier: string) => {
    if (redisLimiter) {
      // Bruk Redis-basert rate limiting
      const result = await redisLimiter.limit(identifier)
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset
      }
    } else {
      // Fallback til in-memory rate limiting
      return await memoryLimiter.limit(identifier)
    }
  }
} 
class SimpleRateLimit {
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
      // Ny eller utløpt vindu
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

export const rateLimiter = new SimpleRateLimit() 
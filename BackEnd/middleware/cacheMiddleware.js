const NodeCache = require("node-cache")

// Create a new cache instance
const cache = new NodeCache({ stdTTL: 300 }) // Default TTL: 5 minutes

/**
 * Middleware to cache API responses
 * @param {number} duration - Cache duration in seconds
 * @returns {Function} - Express middleware function
 */
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== "GET") {
      return next()
    }

    // Create a cache key from the request URL
    const key = req.originalUrl || req.url

    // Check if we have a cache hit
    const cachedResponse = cache.get(key)

    if (cachedResponse) {
      // Return cached response
      return res.json(cachedResponse)
    }

    // Store the original json method
    const originalJson = res.json

    // Override res.json method to cache the response
    res.json = function (body) {
      // Cache the response
      cache.set(key, body, duration)

      // Call the original json method
      originalJson.call(this, body)
    }

    next()
  }
}

/**
 * Clear cache for a specific key
 * @param {string} key - Cache key to clear
 */
const clearCache = (key) => {
  cache.del(key)
}

/**
 * Clear all cache
 */
const clearAllCache = () => {
  cache.flushAll()
}

module.exports = {
  cacheMiddleware,
  clearCache,
  clearAllCache,
}


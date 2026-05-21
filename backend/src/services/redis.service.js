const Redis = require('ioredis');
const dotenv = require('dotenv');

dotenv.config();

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    // Retry connection after 2, 4, 8, 16... seconds, max 30 seconds
    const delay = Math.min(times * 1000 * 2, 30000);
    return delay;
  },
  maxRetriesPerRequest: null, // Essential for ioredis with rate limiting
};

let redis;

try {
  redis = new Redis(redisConfig);

  redis.on('error', (err) => {
    console.error('Redis error:', err);
  });

  redis.on('connect', () => {
    console.log('Connected to Redis');
  });
} catch (err) {
  console.error('Could not initialize Redis client:', err);
}

/**
 * Cache-Aside Helper: Get or Set
 * @param {string} key 
 * @param {Function} fetchFunction - function to fetch data from DB if cache miss
 * @param {number} ttl - Time to live in seconds
 */
async function getOrSetCache(key, fetchFunction, ttl = 300) {
  if (!redis || redis.status !== 'ready') {
    return { data: await fetchFunction(), cache: 'MISS' };
  }

  let data;
  try {
    const cachedData = await redis.get(key);
    if (cachedData) {
      console.log(`Cache Hit: ${key}`);
      return { data: JSON.parse(cachedData), cache: 'HIT' };
    }

    console.log(`Cache Miss: ${key}`);
    data = await fetchFunction();

    if (data) {
      try {
        await redis.set(key, JSON.stringify(data), 'EX', ttl);
      } catch (setErr) {
        console.error(`Redis Set Error for key ${key}:`, setErr);
      }
    }

    return { data, cache: 'MISS' };
  } catch (err) {
    console.error(`Cache Error for key ${key}:`, err);

    if (data !== undefined) return { data, cache: 'MISS' };

    return { data: await fetchFunction(), cache: 'MISS' };
  }
}

async function invalidateCache(key) {
  if (!redis || redis.status !== 'ready') return;
  try {
    await redis.del(key);
    console.log(`Cache Invalidated: ${key}`);
  } catch (err) {
    console.error(`Invalidate Cache Error for key ${key}:`, err);
  }
}

/**
 * Invalidates cache keys matching a specific glob pattern.
 * Uses a Redis SCAN stream rather than KEYS to avoid blocking 
 * the Redis single-threaded event loop in production.
 * @param {string} pattern - Glob pattern like 'food_feed:*'
 */
async function invalidateCachePattern(pattern) {
  if (!redis || redis.status !== 'ready') return;
  return new Promise((resolve, reject) => {
    try {
      const stream = redis.scanStream({
        match: pattern,
        count: 100, // Process in small chunks to prevent performance impacts
      });

      const deletionPromises = [];

      stream.on('data', (keys) => {
        if (keys.length > 0) {
          const p = redis.del(keys).catch((delErr) => {
            console.error(`Error deleting scanned keys for pattern ${pattern}:`, delErr);
          });
          deletionPromises.push(p);
        }
      });

      stream.on('end', async () => {
        try {
          await Promise.all(deletionPromises);
          console.log(`Cache Pattern Invalidated (${pattern}): successfully completed deletion`);
          resolve();
        } catch (err) {
          reject(err);
        }
      });

      stream.on('error', (err) => {
        console.error(`SCAN stream error for pattern ${pattern}:`, err);
        reject(err);
      });
    } catch (err) {
      console.error(`Invalidate Cache Pattern Error for pattern ${pattern}:`, err);
      reject(err);
    }
  });
}

module.exports = {
  redis,
  getOrSetCache,
  invalidateCache,
  invalidateCachePattern,
};

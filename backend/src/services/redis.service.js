const Redis = require('ioredis');
const dotenv = require('dotenv');

dotenv.config();

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    // In development without Redis, stop retrying after 3 attempts
    if (!process.env.REDIS_HOST && times > 3) {
      console.warn('Redis unavailable — running without cache (development mode).');
      return null; // Stop retrying
    }
    // In production, retry with exponential backoff, max 30 seconds
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

module.exports = {
  redis,
  getOrSetCache,
  invalidateCache,
};

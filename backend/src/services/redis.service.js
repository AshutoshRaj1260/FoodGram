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

  try {
    const cachedData = await redis.get(key);
    if (cachedData) {
      console.log(`Cache Hit: ${key}`);
      return { data: JSON.parse(cachedData), cache: 'HIT' };
    }

    console.log(`Cache Miss: ${key}`);
    const data = await fetchFunction();
    if (data) {
      await redis.set(key, JSON.stringify(data), 'EX', ttl);
    }
    return { data, cache: 'MISS' };
  } catch (err) {
    console.error(`Cache Error for key ${key}:`, err);
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

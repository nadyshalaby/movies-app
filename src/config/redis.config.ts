import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  ttl: parseInt(process.env.CACHE_TTL || '300', 10) || 300,
  maxItems: parseInt(process.env.CACHE_MAX_ITEMS || '1000', 10),
  queueHost: process.env.QUEUE_REDIS_HOST || 'localhost',
  queuePort: parseInt(process.env.QUEUE_REDIS_PORT || '6379', 10),
  queueDb: parseInt(process.env.QUEUE_REDIS_DB || '1', 10),
}));
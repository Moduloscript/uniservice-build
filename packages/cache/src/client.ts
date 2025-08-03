import { createClient, RedisClientType } from 'redis';
import { logger } from '@repo/logs';

interface RedisConfig {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
  username?: string;
  database?: number;
  maxRetriesPerRequest?: number;
  retryDelayOnFailover?: number;
  connectTimeout?: number;
  lazyConnect?: boolean;
}

class RedisManager {
  private static instance: RedisManager;
  private client: RedisClientType | null = null;
  private isConnecting = false;

  private constructor() {}

  public static getInstance(): RedisManager {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager();
    }
    return RedisManager.instance;
  }

  public async getClient(): Promise<RedisClientType> {
    if (this.client?.isOpen) {
      return this.client;
    }

    if (this.isConnecting) {
      // Wait for connection to complete
      while (this.isConnecting) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (this.client?.isOpen) {
        return this.client;
      }
    }

    return this.connect();
  }

  private async connect(): Promise<RedisClientType> {
    this.isConnecting = true;

    try {
      const config = this.getRedisConfig();
      
      this.client = createClient({
        url: config.url,
        socket: {
          host: config.host,
          port: config.port,
          connectTimeout: config.connectTimeout || 10000,
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('Redis connection failed after 10 retries');
              return new Error('Redis connection failed');
            }
            return Math.min(retries * 100, 3000);
          }
        },
        username: config.username,
        password: config.password,
        database: config.database,
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error:', err);
      });

      this.client.on('connect', () => {
        logger.info('Redis client connected');
      });

      this.client.on('reconnecting', () => {
        logger.warn('Redis client reconnecting');
      });

      this.client.on('ready', () => {
        logger.info('Redis client ready');
      });

      await this.client.connect();
      logger.info('Redis connection established successfully');

      return this.client;
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  private getRedisConfig(): RedisConfig {
    // Redis Cloud connection format: redis://username:password@host:port
    const redisUrl = process.env.REDIS_URL;
    
    if (redisUrl) {
      return { url: redisUrl };
    }

    // Build Redis Cloud URL from individual components
    const host = process.env.REDIS_HOST;
    const port = process.env.REDIS_PORT;
    const password = process.env.REDIS_PASSWORD;
    const username = process.env.REDIS_USERNAME || 'default';
    const database = process.env.REDIS_DB || '0';
    
    if (host && port && password) {
      // Construct Redis Cloud URL
      const url = `redis://${username}:${password}@${host}:${port}/${database}`;
      return { url };
    }

    // Fallback to individual environment variables
    return {
      host: host || 'localhost',
      port: Number(port) || 6379,
      password: password,
      username: username,
      database: Number(database),
      connectTimeout: 10000,
    };
  }

  public async disconnect(): Promise<void> {
    if (this.client?.isOpen) {
      await this.client.disconnect();
      logger.info('Redis client disconnected');
    }
    this.client = null;
  }

  public async ping(): Promise<string> {
    const client = await this.getClient();
    return client.ping();
  }

  public async isHealthy(): Promise<boolean> {
    try {
      await this.ping();
      return true;
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return false;
    }
  }
}

// Cache operations with proper error handling
export class RedisCache {
  private redisManager = RedisManager.getInstance();

  async get(key: string): Promise<string | null> {
    try {
      const client = await this.redisManager.getClient();
      return await client.get(key);
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    try {
      const client = await this.redisManager.getClient();
      const options = ttlSeconds ? { EX: ttlSeconds } : undefined;
      await client.set(key, value, options);
      return true;
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  }

  async setex(key: string, ttlSeconds: number, value: string): Promise<boolean> {
    try {
      const client = await this.redisManager.getClient();
      await client.setEx(key, ttlSeconds, value);
      return true;
    } catch (error) {
      logger.error(`Redis SETEX error for key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const client = await this.redisManager.getClient();
      const result = await client.del(key);
      return result > 0;
    } catch (error) {
      logger.error(`Redis DEL error for key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const client = await this.redisManager.getClient();
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  async ping(): Promise<string> {
    return this.redisManager.ping();
  }

  async isHealthy(): Promise<boolean> {
    return this.redisManager.isHealthy();
  }

  async disconnect(): Promise<void> {
    return this.redisManager.disconnect();
  }
}

// Export singleton instance
export const redis = new RedisCache();
export default redis;

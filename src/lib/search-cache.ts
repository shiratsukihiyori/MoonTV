// 搜索缓存工具

import { getRedisClient } from './redis.db';

export interface SearchCacheItem {
  query: string;
  results: any[];
  timestamp: number;
  ttl: number; // Time to live in seconds
}

export class SearchCache {
  private static readonly CACHE_PREFIX = 'search:';
  private static readonly DEFAULT_TTL = 3600; // 1 hour

  /**
   * 获取缓存的搜索结果
   */
  static async get(query: string): Promise<any[] | null> {
    try {
      const client = getRedisClient();
      if (!client) return null;

      const key = this.getCacheKey(query);
      const cached = await client.get(key);

      if (!cached) return null;

      const cacheItem: SearchCacheItem = JSON.parse(cached);

      // 检查是否过期
      if (Date.now() - cacheItem.timestamp > cacheItem.ttl * 1000) {
        await this.delete(query);
        return null;
      }

      return cacheItem.results;
    } catch (error) {
      console.error('Search cache get error:', error);
      return null;
    }
  }

  /**
   * 设置搜索结果缓存
   */
  static async set(query: string, results: any[], ttl: number = this.DEFAULT_TTL): Promise<void> {
    try {
      const client = getRedisClient();
      if (!client) return;

      const key = this.getCacheKey(query);
      const cacheItem: SearchCacheItem = {
        query,
        results,
        timestamp: Date.now(),
        ttl,
      };

      await client.setex(key, ttl, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Search cache set error:', error);
    }
  }

  /**
   * 删除搜索缓存
   */
  static async delete(query: string): Promise<void> {
    try {
      const client = getRedisClient();
      if (!client) return;

      const key = this.getCacheKey(query);
      await client.del(key);
    } catch (error) {
      console.error('Search cache delete error:', error);
    }
  }

  /**
   * 清空所有搜索缓存
   */
  static async clear(): Promise<void> {
    try {
      const client = getRedisClient();
      if (!client) return;

      const keys = await client.keys(`${this.CACHE_PREFIX}*`);
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } catch (error) {
      console.error('Search cache clear error:', error);
    }
  }

  /**
   * 获取缓存统计信息
   */
  static async getStats(): Promise<{
    totalKeys: number;
    totalSize: number;
  }> {
    try {
      const client = getRedisClient();
      if (!client) return { totalKeys: 0, totalSize: 0 };

      const keys = await client.keys(`${this.CACHE_PREFIX}*`);
      let totalSize = 0;

      for (const key of keys) {
        const value = await client.get(key);
        if (value) {
          totalSize += Buffer.byteLength(value, 'utf8');
        }
      }

      return {
        totalKeys: keys.length,
        totalSize,
      };
    } catch (error) {
      console.error('Search cache stats error:', error);
      return { totalKeys: 0, totalSize: 0 };
    }
  }

  /**
   * 获取热门搜索查询
   */
  static async getPopularQueries(limit: number = 10): Promise<Array<{ query: string; count: number }>> {
    try {
      const client = getRedisClient();
      if (!client) return [];

      // 这里可以实现基于访问频率的热门查询统计
      // 暂时返回空数组，需要额外的计数逻辑
      return [];
    } catch (error) {
      console.error('Search cache popular queries error:', error);
      return [];
    }
  }

  /**
   * 增加查询计数（用于热门查询统计）
   */
  static async incrementQueryCount(query: string): Promise<void> {
    try {
      const client = getRedisClient();
      if (!client) return;

      const countKey = `query_count:${query}`;
      await client.incr(countKey);
      // 设置过期时间，避免计数无限增长
      await client.expire(countKey, 86400 * 7); // 7天
    } catch (error) {
      console.error('Search cache increment count error:', error);
    }
  }

  /**
   * 获取缓存键
   */
  private static getCacheKey(query: string): string {
    // 对查询进行标准化处理
    const normalizedQuery = query.toLowerCase().trim();
    return `${this.CACHE_PREFIX}${normalizedQuery}`;
  }

  /**
   * 检查缓存是否存在且未过期
   */
  static async exists(query: string): Promise<boolean> {
    try {
      const client = getRedisClient();
      if (!client) return false;

      const key = this.getCacheKey(query);
      const exists = await client.exists(key);
      return exists === 1;
    } catch (error) {
      console.error('Search cache exists error:', error);
      return false;
    }
  }

  /**
   * 获取缓存项的剩余TTL
   */
  static async getTTL(query: string): Promise<number> {
    try {
      const client = getRedisClient();
      if (!client) return -1;

      const key = this.getCacheKey(query);
      return await client.ttl(key);
    } catch (error) {
      console.error('Search cache TTL error:', error);
      return -1;
    }
  }

  /**
   * 批量设置多个缓存项
   */
  static async setMultiple(items: Array<{ query: string; results: any[]; ttl?: number }>): Promise<void> {
    try {
      const client = getRedisClient();
      if (!client) return;

      const pipeline = client.multi();

      for (const item of items) {
        const key = this.getCacheKey(item.query);
        const cacheItem: SearchCacheItem = {
          query: item.query,
          results: item.results,
          timestamp: Date.now(),
          ttl: item.ttl || this.DEFAULT_TTL,
        };

        pipeline.setex(key, item.ttl || this.DEFAULT_TTL, JSON.stringify(cacheItem));
      }

      await pipeline.exec();
    } catch (error) {
      console.error('Search cache set multiple error:', error);
    }
  }

  /**
   * 批量获取多个缓存项
   */
  static async getMultiple(queries: string[]): Promise<Map<string, any[]>> {
    try {
      const client = getRedisClient();
      if (!client) return new Map();

      const keys = queries.map(query => this.getCacheKey(query));
      const values = await client.mget(...keys);

      const result = new Map<string, any[]>();

      for (let i = 0; i < queries.length; i++) {
        const value = values[i];
        if (value) {
          try {
            const cacheItem: SearchCacheItem = JSON.parse(value);
            // 检查是否过期
            if (Date.now() - cacheItem.timestamp <= cacheItem.ttl * 1000) {
              result.set(queries[i], cacheItem.results);
            }
          } catch (error) {
            // 解析失败，跳过
          }
        }
      }

      return result;
    } catch (error) {
      console.error('Search cache get multiple error:', error);
      return new Map();
    }
  }
}

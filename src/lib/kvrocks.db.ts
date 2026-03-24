// KVRocks 数据库客户端

import { createClient, RedisClientType } from 'redis';

export interface KVRocksConfig {
  host: string;
  port: number;
  password?: string;
  database?: number;
  connectTimeout?: number;
  commandTimeout?: number;
}

export class KVRocksClient {
  private client: RedisClientType | null = null;
  private config: KVRocksConfig;
  private connected = false;

  constructor(config: KVRocksConfig) {
    this.config = {
      host: 'localhost',
      port: 6666, // KVRocks 默认端口
      connectTimeout: 5000,
      commandTimeout: 5000,
      ...config,
    };
  }

  /**
   * 连接到 KVRocks 服务器
   */
  async connect(): Promise<void> {
    if (this.connected && this.client) {
      return;
    }

    try {
      const url = this.config.password
        ? `redis://:${this.config.password}@${this.config.host}:${this.config.port}`
        : `redis://${this.config.host}:${this.config.port}`;

      this.client = createClient({
        url,
        database: this.config.database || 0,
        socket: {
          connectTimeout: this.config.connectTimeout,
          commandTimeout: this.config.commandTimeout,
        },
      });

      this.client.on('error', (err) => {
        console.error('KVRocks connection error:', err);
        this.connected = false;
      });

      this.client.on('connect', () => {
        console.log('Connected to KVRocks');
        this.connected = true;
      });

      this.client.on('disconnect', () => {
        console.log('Disconnected from KVRocks');
        this.connected = false;
      });

      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to KVRocks:', error);
      throw error;
    }
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.disconnect();
      } catch (error) {
        console.error('Error disconnecting from KVRocks:', error);
      } finally {
        this.client = null;
        this.connected = false;
      }
    }
  }

  /**
   * 检查连接状态
   */
  isConnected(): boolean {
    return this.connected && this.client !== null;
  }

  /**
   * 获取值
   */
  async get(key: string): Promise<string | null> {
    this.ensureConnected();
    return await this.client!.get(key);
  }

  /**
   * 设置值
   */
  async set(key: string, value: string): Promise<string | null> {
    this.ensureConnected();
    return await this.client!.set(key, value);
  }

  /**
   * 设置值并指定过期时间
   */
  async setex(key: string, seconds: number, value: string): Promise<string | null> {
    this.ensureConnected();
    return await this.client!.setEx(key, seconds, value);
  }

  /**
   * 删除键
   */
  async del(...keys: string[]): Promise<number> {
    this.ensureConnected();
    return await this.client!.del(keys);
  }

  /**
   * 检查键是否存在
   */
  async exists(key: string): Promise<number> {
    this.ensureConnected();
    return await this.client!.exists(key);
  }

  /**
   * 获取键的剩余过期时间
   */
  async ttl(key: string): Promise<number> {
    this.ensureConnected();
    return await this.client!.ttl(key);
  }

  /**
   * 设置键的过期时间
   */
  async expire(key: string, seconds: number): Promise<number> {
    this.ensureConnected();
    return await this.client!.expire(key, seconds);
  }

  /**
   * 批量获取值
   */
  async mget(...keys: string[]): Promise<(string | null)[]> {
    this.ensureConnected();
    return await this.client!.mGet(keys);
  }

  /**
   * 批量设置值
   */
  async mset(keyValues: Record<string, string>): Promise<string | null> {
    this.ensureConnected();
    return await this.client!.mSet(keyValues);
  }

  /**
   * 获取匹配的键
   */
  async keys(pattern: string): Promise<string[]> {
    this.ensureConnected();
    return await this.client!.keys(pattern);
  }

  /**
   * 增加整数值
   */
  async incr(key: string): Promise<number> {
    this.ensureConnected();
    return await this.client!.incr(key);
  }

  /**
   * 增加浮点数值
   */
  async incrbyfloat(key: string, increment: number): Promise<string> {
    this.ensureConnected();
    return await this.client!.incrByFloat(key, increment);
  }

  /**
   * 获取列表长度
   */
  async llen(key: string): Promise<number> {
    this.ensureConnected();
    return await this.client!.lLen(key);
  }

  /**
   * 推入列表左侧
   */
  async lpush(key: string, ...elements: string[]): Promise<number> {
    this.ensureConnected();
    return await this.client!.lPush(key, elements);
  }

  /**
   * 推入列表右侧
   */
  async rpush(key: string, ...elements: string[]): Promise<number> {
    this.ensureConnected();
    return await this.client!.rPush(key, elements);
  }

  /**
   * 弹出列表左侧元素
   */
  async lpop(key: string): Promise<string | null> {
    this.ensureConnected();
    return await this.client!.lPop(key);
  }

  /**
   * 弹出列表右侧元素
   */
  async rpop(key: string): Promise<string | null> {
    this.ensureConnected();
    return await this.client!.rPop(key);
  }

  /**
   * 获取列表范围
   */
  async lrange(key: string, start: number, end: number): Promise<string[]> {
    this.ensureConnected();
    return await this.client!.lRange(key, start, end);
  }

  /**
   * 添加到集合
   */
  async sadd(key: string, ...members: string[]): Promise<number> {
    this.ensureConnected();
    return await this.client!.sAdd(key, members);
  }

  /**
   * 获取集合成员
   */
  async smembers(key: string): Promise<string[]> {
    this.ensureConnected();
    return await this.client!.sMembers(key);
  }

  /**
   * 检查是否是集合成员
   */
  async sismember(key: string, member: string): Promise<number> {
    this.ensureConnected();
    return await this.client!.sIsMember(key, member);
  }

  /**
   * 删除集合成员
   */
  async srem(key: string, ...members: string[]): Promise<number> {
    this.ensureConnected();
    return await this.client!.sRem(key, members);
  }

  /**
   * 获取哈希字段
   */
  async hget(key: string, field: string): Promise<string | null> {
    this.ensureConnected();
    return await this.client!.hGet(key, field);
  }

  /**
   * 设置哈希字段
   */
  async hset(key: string, field: string, value: string): Promise<number> {
    this.ensureConnected();
    return await this.client!.hSet(key, field, value);
  }

  /**
   * 获取哈希所有字段
   */
  async hgetall(key: string): Promise<Record<string, string>> {
    this.ensureConnected();
    return await this.client!.hGetAll(key);
  }

  /**
   * 删除哈希字段
   */
  async hdel(key: string, ...fields: string[]): Promise<number> {
    this.ensureConnected();
    return await this.client!.hDel(key, fields);
  }

  /**
   * 执行 Lua 脚本
   */
  async eval(script: string, keys: string[], args: string[]): Promise<any> {
    this.ensureConnected();
    return await this.client!.eval(script, {
      keys,
      arguments: args,
    });
  }

  /**
   * 发布消息
   */
  async publish(channel: string, message: string): Promise<number> {
    this.ensureConnected();
    return await this.client!.publish(channel, message);
  }

  /**
   * 订阅频道
   */
  async subscribe(channel: string, callback: (message: string, channel: string) => void): Promise<void> {
    this.ensureConnected();
    await this.client!.subscribe(channel, callback);
  }

  /**
   * 取消订阅
   */
  async unsubscribe(channel?: string): Promise<void> {
    this.ensureConnected();
    await this.client!.unsubscribe(channel);
  }

  /**
   * 执行事务
   */
  async multi(): Promise<any> {
    this.ensureConnected();
    return this.client!.multi();
  }

  /**
   * 刷新数据库
   */
  async flushdb(): Promise<string> {
    this.ensureConnected();
    return await this.client!.flushDb();
  }

  /**
   * 获取数据库信息
   */
  async info(section?: string): Promise<string> {
    this.ensureConnected();
    return await this.client!.info(section);
  }

  /**
   * 选择数据库
   */
  async select(database: number): Promise<string> {
    this.ensureConnected();
    return await this.client!.select(database);
  }

  private ensureConnected(): void {
    if (!this.connected || !this.client) {
      throw new Error('KVRocks client is not connected');
    }
  }
}

// 全局 KVRocks 客户端实例
let globalKVRocksClient: KVRocksClient | null = null;

/**
 * 获取全局 KVRocks 客户端实例
 */
export function getKVRocksClient(): KVRocksClient | null {
  return globalKVRocksClient;
}

/**
 * 初始化 KVRocks 客户端
 */
export async function initKVRocksClient(config: KVRocksConfig): Promise<KVRocksClient> {
  if (globalKVRocksClient) {
    await globalKVRocksClient.disconnect();
  }

  globalKVRocksClient = new KVRocksClient(config);
  await globalKVRocksClient.connect();

  return globalKVRocksClient;
}

/**
 * 关闭全局 KVRocks 客户端
 */
export async function closeKVRocksClient(): Promise<void> {
  if (globalKVRocksClient) {
    await globalKVRocksClient.disconnect();
    globalKVRocksClient = null;
  }
}

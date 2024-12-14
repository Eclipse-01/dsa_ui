import { VitalData } from '@/app/data/vitalData';

interface CacheItem {
  data: VitalData[];
  total: number;
  hasNextPage: boolean;
  timestamp: number;
  params: string; // 用作缓存键
}

class DataCache {
  private static instance: DataCache;
  private cache: Map<string, CacheItem>;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

  private constructor() {
    this.cache = new Map();
  }

  static getInstance(): DataCache {
    if (!DataCache.instance) {
      DataCache.instance = new DataCache();
    }
    return DataCache.instance;
  }

  // 生成缓存键
  private generateKey(params: any): string {
    return JSON.stringify(params);
  }

  // 设置缓存
  set(params: any, data: VitalData[], total: number, hasNextPage: boolean): void {
    const key = this.generateKey(params);
    this.cache.set(key, {
      data,
      total,
      hasNextPage,
      timestamp: Date.now(),
      params: key
    });
  }

  // 获取缓存
  get(params: any): { data: VitalData[], total: number, hasNextPage: boolean } | null {
    const key = this.generateKey(params);
    const cached = this.cache.get(key);

    if (!cached) return null;

    // 检查缓存是否过期
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return {
      data: cached.data,
      total: cached.total,
      hasNextPage: cached.hasNextPage
    };
  }

  // 清除缓存
  clear(): void {
    this.cache.clear();
  }

  // 获取缓存统计信息
  getStats(): { size: number, keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const dataCache = DataCache.getInstance();

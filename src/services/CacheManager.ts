interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessed: number;
  hits: number;
}

interface CacheOptions {
  maxSize?: number;
  defaultTTL?: number;
  cleanupInterval?: number;
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number;
  private defaultTTL: number;
  private cleanupInterval: number;
  private cleanupTimer?: NodeJS.Timeout;
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0
  };

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 100;
    this.defaultTTL = options.defaultTTL || 5 * 60 * 1000; // 5 minutes
    this.cleanupInterval = options.cleanupInterval || 60 * 1000; // 1 minute
    
    this.startCleanup();
  }

  set<T>(key: string, data: T, ttl?: number): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      accessed: Date.now(),
      hits: 0
    };

    this.cache.set(key, entry);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    const now = Date.now();
    
    // Check if entry has expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access statistics
    entry.accessed = now;
    entry.hits++;
    this.stats.hits++;

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  getStats() {
    const hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) * 100;
    
    return {
      ...this.stats,
      hitRate: isNaN(hitRate) ? 0 : Math.round(hitRate * 100) / 100,
      size: this.cache.size,
      maxSize: this.maxSize
    };
  }

  // Memory-aware caching with compression for large objects
  setWithCompression<T>(key: string, data: T, ttl?: number): void {
    try {
      const serialized = JSON.stringify(data);
      const compressed = this.compress(serialized);
      
      this.set(key, compressed, ttl);
    } catch (error) {
      console.warn('[CacheManager] Failed to compress data:', error);
      this.set(key, data, ttl);
    }
  }

  getWithDecompression<T>(key: string): T | null {
    const compressed = this.get<string>(key);
    if (!compressed) return null;

    try {
      const decompressed = this.decompress(compressed);
      return JSON.parse(decompressed) as T;
    } catch (error) {
      console.warn('[CacheManager] Failed to decompress data:', error);
      return compressed as unknown as T;
    }
  }

  private evictLRU(): void {
    let oldestKey = '';
    let oldestAccess = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessed < oldestAccess) {
        oldestAccess = entry.accessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`[CacheManager] Cleaned up ${keysToDelete.length} expired entries`);
    }
  }

  private compress(data: string): string {
    // Simple compression using btoa (base64)
    // In a real implementation, you might use a library like pako for gzip compression
    return btoa(data);
  }

  private decompress(data: string): string {
    return atob(data);
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}

// Global cache instance
export const cacheManager = new CacheManager({
  maxSize: 200,
  defaultTTL: 10 * 60 * 1000, // 10 minutes
  cleanupInterval: 2 * 60 * 1000 // 2 minutes
});

// Utility functions for common caching patterns
export const withCache = <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> => {
  const cached = cacheManager.get<T>(key);
  if (cached) {
    return Promise.resolve(cached);
  }

  return fetcher().then(data => {
    cacheManager.set(key, data, ttl);
    return data;
  });
};

export default CacheManager;
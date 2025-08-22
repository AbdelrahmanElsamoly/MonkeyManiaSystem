// cache.service.ts
import { Injectable } from '@angular/core';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiryTime: number;
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  persistToLocalStorage?: boolean; // Whether to persist cache to localStorage
}

@Injectable({
  providedIn: 'root', // This makes it a singleton service
})
export class CacheService {
  private caches = new Map<string, Map<string, CacheEntry<any>>>();
  private configs = new Map<string, CacheConfig>();

  constructor() {
    // Load persisted caches on service initialization
    this.loadPersistedCaches();
  }

  // Create or get a cache instance
  getCache<T>(cacheName: string, config?: CacheConfig): CacheManager<T> {
    if (!this.caches.has(cacheName)) {
      this.caches.set(cacheName, new Map());

      // Set default config
      const defaultConfig: CacheConfig = {
        ttl: 5 * 60 * 1000, // 5 minutes default
        maxSize: 100,
        persistToLocalStorage: false,
      };

      this.configs.set(cacheName, { ...defaultConfig, ...config });
    }

    return new CacheManager<T>(cacheName, this);
  }

  // Internal methods for CacheManager
  _set<T>(cacheName: string, key: string, data: T, customTtl?: number): void {
    const cache = this.caches.get(cacheName);
    const config = this.configs.get(cacheName);

    if (!cache || !config) return;

    const ttl = customTtl || config.ttl;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiryTime: Date.now() + ttl,
    };

    // Check cache size limit
    if (config.maxSize && cache.size >= config.maxSize && !cache.has(key)) {
      // Remove oldest entry
      const oldestKey = this._getOldestKey(cacheName);
      if (oldestKey) {
        cache.delete(oldestKey);
      }
    }

    cache.set(key, entry);

    // Persist to localStorage if enabled
    if (config.persistToLocalStorage) {
      this._persistCache(cacheName);
    }
  }

  _get<T>(cacheName: string, key: string): T | null {
    const cache = this.caches.get(cacheName);
    if (!cache) return null;

    const entry = cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) return null;

    // Check if entry has expired
    if (Date.now() > entry.expiryTime) {
      cache.delete(key);
      return null;
    }

    return entry.data;
  }

  _has(cacheName: string, key: string): boolean {
    const data = this._get(cacheName, key);
    return data !== null;
  }

  _clear(cacheName: string): void {
    const cache = this.caches.get(cacheName);
    if (cache) {
      cache.clear();

      // Clear from localStorage if persistence is enabled
      const config = this.configs.get(cacheName);
      if (config?.persistToLocalStorage) {
        localStorage.removeItem(`cache_${cacheName}`);
      }
    }
  }

  _clearPattern(cacheName: string, pattern: string): void {
    const cache = this.caches.get(cacheName);
    if (!cache) return;

    const keysToDelete: string[] = [];
    cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => cache.delete(key));

    // Update localStorage if persistence is enabled
    const config = this.configs.get(cacheName);
    if (config?.persistToLocalStorage) {
      this._persistCache(cacheName);
    }
  }

  _getStats(cacheName: string): { size: number; keys: string[] } {
    const cache = this.caches.get(cacheName);
    if (!cache) return { size: 0, keys: [] };

    return {
      size: cache.size,
      keys: Array.from(cache.keys()),
    };
  }

  private _getOldestKey(cacheName: string): string | undefined {
    const cache = this.caches.get(cacheName);
    if (!cache) return undefined;

    let oldestKey: string | undefined;
    let oldestTimestamp = Date.now();

    cache.forEach((entry, key) => {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    });

    return oldestKey;
  }

  // Persistence methods
  private _persistCache(cacheName: string): void {
    try {
      const cache = this.caches.get(cacheName);
      if (!cache) return;

      const serializedCache = JSON.stringify(Array.from(cache.entries()));
      localStorage.setItem(`cache_${cacheName}`, serializedCache);
    } catch (error) {
      console.error(`Failed to persist cache ${cacheName}:`, error);
    }
  }

  private loadPersistedCaches(): void {
    try {
      // Get all cache keys from localStorage
      const cacheKeys = Object.keys(localStorage).filter((key) =>
        key.startsWith('cache_')
      );

      cacheKeys.forEach((storageKey) => {
        const cacheName = storageKey.replace('cache_', '');
        const serializedCache = localStorage.getItem(storageKey);

        if (serializedCache) {
          const cacheEntries = JSON.parse(serializedCache);
          const cache = new Map<string, CacheEntry<any>>(cacheEntries);

          // Filter out expired entries
          const now = Date.now();
          const validEntries = new Map<string, CacheEntry<any>>();

          cache.forEach((entry, key) => {
            if (now <= entry.expiryTime) {
              validEntries.set(key, entry);
            }
          });

          if (validEntries.size > 0) {
            this.caches.set(cacheName, validEntries);
            // Set default config for persisted cache
            this.configs.set(cacheName, {
              ttl: 5 * 60 * 1000,
              maxSize: 100,
              persistToLocalStorage: true,
            });
          } else {
            // Remove empty cache from localStorage
            localStorage.removeItem(storageKey);
          }
        }
      });
    } catch (error) {
      console.error('Failed to load persisted caches:', error);
    }
  }

  // Clear all caches
  clearAllCaches(): void {
    this.caches.forEach((_, cacheName) => {
      this._clear(cacheName);
    });
    this.caches.clear();
    this.configs.clear();
  }

  // Get all cache statistics
  getAllCacheStats(): {
    [cacheName: string]: { size: number; keys: string[] };
  } {
    const stats: { [cacheName: string]: { size: number; keys: string[] } } = {};

    this.caches.forEach((_, cacheName) => {
      stats[cacheName] = this._getStats(cacheName);
    });

    return stats;
  }
}

// Helper class for easier cache management
export class CacheManager<T> {
  constructor(private cacheName: string, private cacheService: CacheService) {}

  set(key: string, data: T, customTtl?: number): void {
    this.cacheService._set(this.cacheName, key, data, customTtl);
  }

  get(key: string): T | null {
    return this.cacheService._get<T>(this.cacheName, key);
  }

  has(key: string): boolean {
    return this.cacheService._has(this.cacheName, key);
  }

  clear(): void {
    this.cacheService._clear(this.cacheName);
  }

  clearPattern(pattern: string): void {
    this.cacheService._clearPattern(this.cacheName, pattern);
  }

  getStats(): { size: number; keys: string[] } {
    return this.cacheService._getStats(this.cacheName);
  }
}

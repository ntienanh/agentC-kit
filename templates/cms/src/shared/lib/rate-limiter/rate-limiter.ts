import type { NextRequest } from 'next/server';

interface RateLimitEntry {
  count: number;
  windowStart: number;
  expiresAt: number;
}

export interface RateLimiterConfig {
  maxRequests: number;
  windowSeconds: number;
}

export const RATE_LIMITS = {
  login: { maxRequests: process.env.NODE_ENV === 'development' ? 1000 : 15, windowSeconds: 300 },
  register: { maxRequests: 20, windowSeconds: 3600 },
  forgotPassword: { maxRequests: 10, windowSeconds: 3600 },
  resetPassword: { maxRequests: 10, windowSeconds: 3600 },
  changePassword: { maxRequests: 10, windowSeconds: 3600 },
  default: { maxRequests: 100, windowSeconds: 60 },
} as const;

const rateLimitStore = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

function getRateLimitKey(identifier: string, endpoint: string): string {
  return `${identifier}:${endpoint}`;
}

export class RateLimiter {
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanup();
  }

  private startCleanup(): void {
    if (this.cleanupTimer) {
      return;
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, CLEANUP_INTERVAL_MS);

    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.expiresAt <= now) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      rateLimitStore.delete(key);
    }
  }

  async check(request: NextRequest, endpoint: string, config: RateLimiterConfig): Promise<void> {
    const identifier = getClientIp(request);
    const key = getRateLimitKey(identifier, endpoint);
    const now = Date.now();

    const entry = rateLimitStore.get(key);

    if (!entry) {
      rateLimitStore.set(key, {
        count: 1,
        windowStart: now,
        expiresAt: now + config.windowSeconds * 1000,
      });
      return;
    }

    if (entry.expiresAt <= now) {
      rateLimitStore.set(key, {
        count: 1,
        windowStart: now,
        expiresAt: now + config.windowSeconds * 1000,
      });
      return;
    }

    entry.count += 1;

    if (entry.count > config.maxRequests) {
      throw new Error('RATE_LIMIT_EXCEEDED');
    }

    rateLimitStore.set(key, entry);
  }

  reset(identifier: string, endpoint: string): void {
    const key = getRateLimitKey(identifier, endpoint);
    rateLimitStore.delete(key);
  }

  clear(): void {
    rateLimitStore.clear();
  }

  getCount(identifier: string, endpoint: string): number {
    const key = getRateLimitKey(identifier, endpoint);
    const entry = rateLimitStore.get(key);
    return entry?.count || 0;
  }
}

export const rateLimiter = new RateLimiter();

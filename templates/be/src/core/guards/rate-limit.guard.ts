import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RATE_LIMIT_KEY, RateLimitOptions } from '@shared/decorators';

interface ClientRecord {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly records = new Map<string, ClientRecord>();

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? { ttl: 60, limit: 5 };

    const http = context.switchToHttp();
    const req = http.getRequest<{
      ip?: string;
      headers: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
      path?: string;
      url?: string;
      method?: string;
    }>();
    const res = http.getResponse<{
      setHeader?: (name: string, value: string | number) => void;
    }>();

    const rawIp =
      req?.ip ||
      (Array.isArray(req?.headers?.['x-forwarded-for'])
        ? req.headers['x-forwarded-for'][0]
        : req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim()) ||
      req?.socket?.remoteAddress ||
      '127.0.0.1';

    const routeKey = `${req?.method ?? 'POST'}:${req?.path ?? req?.url ?? 'auth'}`;
    const key = `${rawIp}:${routeKey}`;

    const now = Date.now();
    const windowMs = options.ttl * 1000;

    let record = this.records.get(key);

    if (!record || now >= record.resetTime) {
      record = {
        count: 0,
        resetTime: now + windowMs,
      };
      this.records.set(key, record);
    }

    record.count += 1;

    const remaining = Math.max(0, options.limit - record.count);
    const resetTimestamp = Math.ceil(record.resetTime / 1000);
    const retryAfter = Math.max(1, Math.ceil((record.resetTime - now) / 1000));

    if (res?.setHeader) {
      res.setHeader('X-RateLimit-Limit', options.limit);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', resetTimestamp);
    }

    if (record.count > options.limit) {
      if (res?.setHeader) {
        res.setHeader('Retry-After', retryAfter);
      }
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests. Please try again later.',
          error: 'Too Many Requests',
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (this.records.size > 1000) {
      this.cleanup();
    }

    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.records.entries()) {
      if (now >= record.resetTime) {
        this.records.delete(key);
      }
    }
  }

  resetAll(): void {
    this.records.clear();
  }
}

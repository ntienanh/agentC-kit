import type { NextRequest } from 'next/server';

export interface LogEntry {
  timestamp: string;
  endpoint: string;
  method: string;
  clientIp: string;
  duration?: number;
  status?: number;
  errorCode?: string;
  userId?: string;
  userAgent?: string;
}

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface StructuredLog extends LogEntry {
  level: LogLevel;
}

const SENSITIVE_FIELDS = new Set([
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secret',
  'authorization',
  'cookie',
]);

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

export class RequestLogger {
  private formatLog(entry: StructuredLog): string {
    return JSON.stringify(entry);
  }

  private log(level: LogLevel, entry: LogEntry): void {
    const structuredLog: StructuredLog = {
      level,
      ...entry,
    };

    const formatted = this.formatLog(structuredLog);

    switch (level) {
      case 'error':
        console.error(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'debug':
        console.debug(formatted);
        break;
      default:
        console.log(formatted);
    }
  }

  private isSensitiveField(fieldName: string): boolean {
    const lowerField = fieldName.toLowerCase();
    for (const sensitive of SENSITIVE_FIELDS) {
      if (lowerField.includes(sensitive)) {
        return true;
      }
    }
    return false;
  }

  private sanitizeData(data: unknown): unknown {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (this.isSensitiveField(key)) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  logRequest(request: NextRequest, endpoint: string): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      endpoint,
      method: request.method,
      clientIp: getClientIp(request),
      userAgent: request.headers.get('user-agent') || undefined,
    };

    this.log('info', entry);
  }

  logSuccess(entry: LogEntry): void {
    this.log('info', {
      ...entry,
      timestamp: new Date().toISOString(),
    });
  }

  logError(entry: LogEntry, error: Error): void {
    const sanitizedError = this.sanitizeData({
      message: error.message,
      name: error.name,
    }) as Record<string, unknown>;

    this.log('error', {
      ...entry,
      timestamp: new Date().toISOString(),
      errorCode: entry.errorCode || 'UNKNOWN_ERROR',
      ...sanitizedError,
    });
  }

  logRateLimit(clientIp: string, endpoint: string): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      endpoint,
      method: 'RATE_LIMIT',
      clientIp,
      errorCode: 'RATE_LIMIT_EXCEEDED',
    };

    this.log('warn', entry);
  }

  logWithData(level: LogLevel, entry: LogEntry, data?: unknown): void {
    const sanitizedData = data ? this.sanitizeData(data) : undefined;
    const logEntry: LogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    if (sanitizedData) {
      this.log(level, { ...logEntry, data: sanitizedData } as LogEntry);
    } else {
      this.log(level, logEntry);
    }
  }
}

export const requestLogger = new RequestLogger();

import { Injectable, LogLevel } from '@nestjs/common';
import { RequestContextService } from '../context/request-context.service';

export type LogMeta = Record<string, unknown>;

export interface StructuredLogEntry {
  level: LogLevel | 'error' | 'warn' | 'log' | 'debug' | 'verbose';
  timestamp: string;
  traceId: string;
  context?: string;
  message: string;
  metadata?: LogMeta;
  error?: string;
}

@Injectable()
export class StructuredLoggerService {
  constructor(private readonly contextService: RequestContextService) {}

  private emit(entry: StructuredLogEntry): void {
    if (process.env.NODE_ENV !== 'test') {
      process.stdout.write(JSON.stringify(entry) + '\n');
    }
  }

  log(message: string, context?: string, metadata?: LogMeta): void {
    this.emit({
      level: 'log',
      timestamp: new Date().toISOString(),
      traceId: this.contextService.getTraceId(),
      context,
      message,
      metadata,
    });
  }

  error(
    message: string,
    error?: Error | string,
    context?: string,
    metadata?: LogMeta,
  ): void {
    this.emit({
      level: 'error',
      timestamp: new Date().toISOString(),
      traceId: this.contextService.getTraceId(),
      context,
      message,
      metadata,
      error: error instanceof Error ? error.stack : error,
    });
  }

  warn(message: string, context?: string, metadata?: LogMeta): void {
    this.emit({
      level: 'warn',
      timestamp: new Date().toISOString(),
      traceId: this.contextService.getTraceId(),
      context,
      message,
      metadata,
    });
  }

  debug(message: string, context?: string, metadata?: LogMeta): void {
    this.emit({
      level: 'debug',
      timestamp: new Date().toISOString(),
      traceId: this.contextService.getTraceId(),
      context,
      message,
      metadata,
    });
  }
}

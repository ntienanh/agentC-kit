
import { ErrorSeverity, type EnhancedError } from './types';
import { formatErrorForLog } from './utils';

interface PinoLogger {
  fatal: (obj: Record<string, unknown>, msg: string) => void;
  error: (obj: Record<string, unknown>, msg: string) => void;
  warn: (obj: Record<string, unknown>, msg: string) => void;
  info: (obj: Record<string, unknown>, msg: string) => void;
  debug: (obj: Record<string, unknown>, msg: string) => void;
  child: (bindings: Record<string, unknown>) => PinoLogger;
}

let pinoInstance: PinoLogger | null = null;

const consoleLogger: PinoLogger = {
  fatal: (obj, msg) => console.error(`[FATAL] ${msg}`, obj),
  error: (obj, msg) => console.error(`[ERROR] ${msg}`, obj),
  warn: (obj, msg) => console.warn(`[WARN] ${msg}`, obj),
  info: (obj, msg) => console.info(`[INFO] ${msg}`, obj),
  debug: (obj, msg) => console.debug(`[DEBUG] ${msg}`, obj),
  child: () => consoleLogger,
};

export async function initializeLogger(): Promise<PinoLogger> {
  if (pinoInstance) return pinoInstance;
  pinoInstance = consoleLogger;
  return pinoInstance;
}

export async function getLogger(): Promise<PinoLogger> {
  if (!pinoInstance) {
    return initializeLogger();
  }
  return pinoInstance;
}

export async function createModuleLogger(module: string): Promise<PinoLogger> {
  const logger = await getLogger();
  return logger.child({ module });
}

export async function logError(error: EnhancedError, additionalContext?: Record<string, unknown>): Promise<void> {
  const logger = await createModuleLogger('error-handler');
  const logEntry = {
    ...formatErrorForLog(error),
    ...additionalContext,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'server',
  };

  switch (error.severity) {
    case ErrorSeverity.CRITICAL:
      logger.fatal(logEntry, `CRITICAL ERROR: ${error.message}`);
      await sendCriticalAlert(error);
      break;
    case ErrorSeverity.HIGH:
      logger.error(logEntry, `ERROR: ${error.message}`);
      break;
    case ErrorSeverity.MEDIUM:
      logger.warn(logEntry, `WARNING: ${error.message}`);
      break;
    case ErrorSeverity.LOW:
      logger.info(logEntry, `INFO: ${error.message}`);
      break;
    default:
      logger.error(logEntry, `ERROR: ${error.message}`);
  }
}

export async function logHttpRequest(
  requestId: string,
  method: string,
  url: string,
  endpoint: string,
  headers?: Record<string, string>,
): Promise<void> {
  const logger = await createModuleLogger('http-client');
  logger.info(
    {
      requestId,
      type: 'request',
      method,
      url,
      endpoint,
      headers: sanitizeHeaders(headers),
    },
    `HTTP Request: ${method} ${endpoint}`,
  );
}

export async function logHttpResponse(
  requestId: string,
  status: number,
  endpoint: string,
  duration: number,
  body?: unknown,
): Promise<void> {
  const logger = await createModuleLogger('http-client');
  const logLevel = status >= 400 ? 'warn' : 'info';

  logger[logLevel](
    {
      requestId,
      type: 'response',
      status,
      endpoint,
      duration: `${duration.toFixed(2)}ms`,
      body: status >= 400 ? body : undefined,
    },
    `HTTP Response: ${status} ${endpoint} (${duration.toFixed(2)}ms)`,
  );
}

export async function logHttpError(requestId: string, status: number, endpoint: string, error: unknown): Promise<void> {
  const logger = await createModuleLogger('http-client');
  logger.error(
    {
      requestId,
      type: 'error',
      status,
      endpoint,
      error: error instanceof Error ? error.message : 'Unknown error',
    },
    `HTTP Error: ${status} ${endpoint}`,
  );
}

export async function logPerformance(operation: string, duration: number, success: boolean): Promise<void> {
  const logger = await createModuleLogger('performance');
  logger.info(
    {
      type: 'performance',
      operation,
      duration: `${duration.toFixed(2)}ms`,
      success,
    },
    `Performance: ${operation} - ${duration.toFixed(2)}ms`,
  );
}

export async function logTrace(
  traceId: string,
  component: string,
  action: string,
  status: 'started' | 'completed' | 'failed',
  duration?: number,
  error?: string,
): Promise<void> {
  const logger = await createModuleLogger('trace');
  const baseLog = {
    traceId,
    component,
    action,
    status,
  };

  if (status === 'started') {
    logger.info(baseLog, `Trace started: ${component}.${action}`);
  } else if (status === 'completed' && duration !== undefined) {
    logger.info(
      { ...baseLog, duration: `${duration.toFixed(2)}ms` },
      `Trace completed: ${component}.${action} (${duration.toFixed(2)}ms)`,
    );
  } else if (status === 'failed' && duration !== undefined) {
    logger.error(
      { ...baseLog, duration: `${duration.toFixed(2)}ms`, error },
      `Trace failed: ${component}.${action} (${duration.toFixed(2)}ms)`,
    );
  }
}

function sanitizeHeaders(headers?: Record<string, string>): Record<string, string> | undefined {
  if (!headers) return undefined;

  const sanitized = { ...headers };
  const sensitiveFields = ['authorization', 'cookie', 'x-api-key', 'x-secret'];

  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveFields.some(sf => lowerKey.includes(sf))) {
      sanitized[key] = '[REDACTED]';
    }
  }

  return sanitized;
}

async function sendCriticalAlert(error: EnhancedError): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    console.error('CRITICAL ALERT:', error);
  }
}

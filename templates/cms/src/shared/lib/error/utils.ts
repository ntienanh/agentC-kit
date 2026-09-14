
import {
  type EnhancedError,
  type ErrorCategory,
  type ErrorContext,
  type ErrorSeverity,
  ApiErrorType,
  ErrorCategory as Category,
  NetworkErrorType,
  ErrorSeverity as Severity,
} from './types';

export function generateErrorId(): string {
  return `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateCorrelationId(): string {
  return `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function categorizeError(error: unknown): ErrorCategory {
  if (error instanceof Response) {
    const status = error.status;

    if (!navigator.onLine) {
      return Category.NETWORK;
    }

    if (status === 401) return Category.AUTHENTICATION;
    if (status === 403) return Category.AUTHORIZATION;
    if (status >= 500) return Category.SERVER;
    if (status >= 400) return Category.API;

    return Category.UNKNOWN;
  }

  if (
    error instanceof TypeError &&
    (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch'))
  ) {
    return Category.NETWORK;
  }

  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>;
    if (err.name === 'ValidationError' || err.validation || err.errors) {
      return Category.VALIDATION;
    }
  }

  if (error instanceof TypeError || error instanceof ReferenceError) {
    return Category.CLIENT;
  }

  return Category.UNKNOWN;
}

export function determineSeverity(category: ErrorCategory, statusCode?: number): ErrorSeverity {
  switch (category) {
    case Category.SERVER:
      return Severity.CRITICAL;
    case Category.AUTHENTICATION:
    case Category.AUTHORIZATION:
      return Severity.HIGH;
    case Category.NETWORK:
      return Severity.HIGH;
    case Category.API:
      if (statusCode === 404) return Severity.MEDIUM;
      if (statusCode === 422) return Severity.MEDIUM;
      if (statusCode === 429) return Severity.MEDIUM;
      return Severity.HIGH;
    case Category.VALIDATION:
      return Severity.MEDIUM;
    case Category.BUSINESS_LOGIC:
      return Severity.MEDIUM;
    case Category.CLIENT:
      return Severity.MEDIUM;
    default:
      return Severity.LOW;
  }
}

export function getApiErrorType(statusCode: number): ApiErrorType {
  switch (statusCode) {
    case 400:
      return ApiErrorType.BAD_REQUEST;
    case 401:
      return ApiErrorType.UNAUTHORIZED;
    case 403:
      return ApiErrorType.FORBIDDEN;
    case 404:
      return ApiErrorType.NOT_FOUND;
    case 405:
      return ApiErrorType.METHOD_NOT_ALLOWED;
    case 409:
      return ApiErrorType.CONFLICT;
    case 422:
      return ApiErrorType.UNPROCESSABLE_ENTITY;
    case 429:
      return ApiErrorType.TOO_MANY_REQUESTS;
    case 500:
      return ApiErrorType.INTERNAL_SERVER_ERROR;
    case 503:
      return ApiErrorType.SERVICE_UNAVAILABLE;
    case 504:
      return ApiErrorType.GATEWAY_TIMEOUT;
    default:
      return statusCode >= 500 ? ApiErrorType.INTERNAL_SERVER_ERROR : ApiErrorType.BAD_REQUEST;
  }
}

export function getNetworkErrorType(error: unknown): NetworkErrorType {
  if (!(error instanceof Error)) return NetworkErrorType.UNKNOWN;

  const message = error.message.toLowerCase();

  if (message.includes('timeout')) return NetworkErrorType.TIMEOUT;
  if (message.includes('offline') || !navigator.onLine) return NetworkErrorType.OFFLINE;
  if (message.includes('cors')) return NetworkErrorType.CORS;
  if (message.includes('dns')) return NetworkErrorType.DNS;
  if (message.includes('refused') || message.includes('econnrefused')) {
    return NetworkErrorType.CONNECTION_REFUSED;
  }

  return NetworkErrorType.UNKNOWN;
}

export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>;
    if (typeof err.message === 'string') return err.message;
    if (typeof err.error === 'string') return err.error;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
}

export function extractErrorCode(error: unknown): number {
  if (error instanceof Response) {
    return error.status;
  }

  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>;
    if (typeof err.status === 'number') return err.status;
    if (typeof err.code === 'number') return err.code;
    if (typeof err.statusCode === 'number') return err.statusCode;
  }

  return 0;
}

export function createErrorContext(component?: string, action?: string, data?: Record<string, unknown>): ErrorContext {
  return {
    component,
    action,
    data,
  };
}

export function sanitizeContextData(data?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!data) return undefined;

  const sensitiveKeys = ['password', 'token', 'secret', 'authorization', 'cookie'];
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export function generateSuggestedActions(category: ErrorCategory): string[] {
  switch (category) {
    case Category.NETWORK:
      return ['Check your internet connection', 'Try again in a few seconds', 'Contact support if the issue continues'];
    case Category.AUTHENTICATION:
      return ['Sign in again to continue', 'Check your sign-in information'];
    case Category.AUTHORIZATION:
      return ['Contact an administrator to request access', 'Check your role'];
    case Category.VALIDATION:
      return ['Check the information you entered', 'Make sure all required fields are filled in'];
    case Category.SERVER:
      return ['Try again in a few minutes', 'Contact support if the issue continues'];
    default:
      return ['Try the action again', 'Contact support if the issue continues'];
  }
}

export function getHelpLinks(category: ErrorCategory): string[] {
  const baseLinks: Record<ErrorCategory, string[]> = {
    [Category.NETWORK]: ['/docs/troubleshooting/network'],
    [Category.API]: ['/docs/api/errors'],
    [Category.VALIDATION]: ['/docs/forms/validation'],
    [Category.BUSINESS_LOGIC]: ['/docs/business-rules'],
    [Category.AUTHENTICATION]: ['/docs/auth/login-issues'],
    [Category.AUTHORIZATION]: ['/docs/auth/permissions'],
    [Category.CLIENT]: ['/docs/troubleshooting/client-errors'],
    [Category.SERVER]: ['/docs/status'],
    [Category.UNKNOWN]: ['/support'],
  };

  return baseLinks[category] || ['/support'];
}

export function shouldBeVisibleToUser(category: ErrorCategory, severity: ErrorSeverity): boolean {
  if (category === Category.VALIDATION) return true;

  if (category === Category.AUTHENTICATION || category === Category.AUTHORIZATION) {
    return true;
  }

  if (severity === Severity.HIGH || severity === Severity.CRITICAL) {
    return true;
  }

  if (category === Category.CLIENT && severity === Severity.LOW) {
    return false;
  }

  return true;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatErrorForLog(error: EnhancedError): Record<string, unknown> {
  return {
    errorId: error.id,
    category: error.category,
    type: error.type,
    severity: error.severity,
    code: error.code,
    message: error.message,
    timestamp: error.timestamp.toISOString(),
    context: error.context,
    userVisible: error.userVisible,
    handled: error.handled,
  };
}

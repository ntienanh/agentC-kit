
import {
  type EnhancedError,
  type ErrorContext,
  ApiErrorType,
  ErrorCategory,
  ErrorSeverity,
  NetworkErrorType,
  ValidationErrorType,
} from './types';
import {
  categorizeError,
  determineSeverity,
  extractErrorCode,
  extractErrorMessage,
  generateErrorId,
  generateSuggestedActions,
  getApiErrorType,
  getHelpLinks,
  getNetworkErrorType,
  sanitizeContextData,
  shouldBeVisibleToUser,
} from './utils';

export function transformUnknownError(error: unknown, context?: ErrorContext): EnhancedError {
  if (typeof error === 'object' && error !== null && 'id' in error && 'category' in error) {
    return error as EnhancedError;
  }

  const category = categorizeError(error);
  const code = extractErrorCode(error);
  const severity = determineSeverity(category, code);

  return {
    id: generateErrorId(),
    code,
    message: extractErrorMessage(error),
    category,
    type: getErrorType(category, error),
    severity,
    timestamp: new Date(),
    userVisible: shouldBeVisibleToUser(category, severity),
    handled: false,
    context: context
      ? {
          ...context,
          data: sanitizeContextData(context.data),
        }
      : undefined,
    suggestedActions: generateSuggestedActions(category),
    helpLinks: getHelpLinks(category),
    originalError: error,
    stack: error instanceof Error ? error.stack : undefined,
  };
}

export function transformApiError(error: Response | Record<string, unknown>, context?: ErrorContext): EnhancedError {
  const isResponse = error instanceof Response;
  const statusCode = isResponse ? error.status : (error.status as number) || 500;
  const errorData = isResponse ? {} : error;

  const category = ErrorCategory.API;
  const type = getApiErrorType(statusCode);
  const severity = determineSeverity(category, statusCode);

  return {
    id: generateErrorId(),
    code: statusCode,
    message: extractApiErrorMessage(error, errorData),
    category,
    type,
    severity,
    timestamp: new Date(),
    userVisible: shouldBeVisibleToUser(category, severity),
    handled: false,
    context: context
      ? {
          ...context,
          data: sanitizeContextData(context.data),
        }
      : undefined,
    suggestedActions: generateSuggestedActions(category),
    helpLinks: getHelpLinks(category),
    originalError: error,
  };
}

export function transformNetworkError(
  error: Error,
  request?: { url: string; method: string },
  context?: ErrorContext,
): EnhancedError {
  const category = ErrorCategory.NETWORK;
  const type = getNetworkErrorType(error);
  const severity = ErrorSeverity.HIGH;

  return {
    id: generateErrorId(),
    code: 0,
    message: getNetworkErrorMessage(type),
    category,
    type,
    severity,
    timestamp: new Date(),
    userVisible: true,
    handled: false,
    context: {
      ...context,
      data: {
        ...sanitizeContextData(context?.data),
        requestUrl: request?.url,
        requestMethod: request?.method,
      },
    },
    suggestedActions: generateSuggestedActions(category),
    helpLinks: getHelpLinks(category),
    originalError: error,
    stack: error.stack,
  };
}

export function transformValidationError(error: Record<string, unknown>, context?: ErrorContext): EnhancedError {
  const category = ErrorCategory.VALIDATION;
  const type = ValidationErrorType.CUSTOM;
  const severity = ErrorSeverity.MEDIUM;

  return {
    id: generateErrorId(),
    code: 422,
    message: extractValidationErrorMessage(error),
    category,
    type,
    severity,
    timestamp: new Date(),
    userVisible: true,
    handled: false,
    context: context
      ? {
          ...context,
          data: sanitizeContextData(context.data),
        }
      : undefined,
    suggestedActions: generateSuggestedActions(category),
    helpLinks: getHelpLinks(category),
    originalError: error,
  };
}

export function createEnhancedError(
  error: unknown,
  config: {
    category?: ErrorCategory;
    type?: string;
    severity?: ErrorSeverity;
    message?: string;
    userVisible?: boolean;
    context?: ErrorContext;
    suggestedActions?: string[];
    helpLinks?: string[];
  },
): EnhancedError {
  const baseError = transformUnknownError(error);

  return {
    ...baseError,
    category: config.category ?? baseError.category,
    type: config.type ?? baseError.type,
    severity: config.severity ?? baseError.severity,
    message: config.message ?? baseError.message,
    userVisible: config.userVisible ?? baseError.userVisible,
    context: config.context
      ? {
          ...config.context,
          data: sanitizeContextData(config.context.data),
        }
      : baseError.context,
    suggestedActions: config.suggestedActions ?? baseError.suggestedActions,
    helpLinks: config.helpLinks ?? baseError.helpLinks,
  };
}

function getErrorType(category: ErrorCategory, error: unknown): string {
  switch (category) {
    case ErrorCategory.API:
      return error instanceof Response ? getApiErrorType(error.status) : ApiErrorType.INTERNAL_SERVER_ERROR;
    case ErrorCategory.NETWORK:
      return error instanceof Error ? getNetworkErrorType(error) : NetworkErrorType.UNKNOWN;
    case ErrorCategory.VALIDATION:
      return ValidationErrorType.CUSTOM;
    default:
      return 'unknown';
  }
}

function extractApiErrorMessage(error: Response | Record<string, unknown>, errorData: Record<string, unknown>): string {
  if (error instanceof Response) {
    return error.statusText || `HTTP Error ${error.status}`;
  }

  if (typeof errorData.message === 'string') return errorData.message;
  if (typeof errorData.error === 'string') return errorData.error;
  if (typeof errorData.msg === 'string') return errorData.msg;

  return 'API request failed';
}

function getNetworkErrorMessage(type: NetworkErrorType): string {
  const messages: Record<NetworkErrorType, string> = {
    [NetworkErrorType.TIMEOUT]: 'The connection timed out. Please try again.',
    [NetworkErrorType.OFFLINE]: 'No internet connection. Please check your network.',
    [NetworkErrorType.CORS]: 'CORS error. Please contact support.',
    [NetworkErrorType.DNS]: 'DNS error. Could not find the server.',
    [NetworkErrorType.CONNECTION_REFUSED]: 'Connection refused. The server may be under maintenance.',
    [NetworkErrorType.UNKNOWN]: 'Network error. Please try again.',
  };

  return messages[type] || messages[NetworkErrorType.UNKNOWN];
}

function extractValidationErrorMessage(error: Record<string, unknown>): string {
  if (typeof error.message === 'string') return error.message;
  if (Array.isArray(error.errors)) {
    return error.errors.map(e => (typeof e === 'string' ? e : e.message)).join(', ');
  }
  return 'Invalid data. Please check again.';
}

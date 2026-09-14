
import type { ApiError as BaseApiError } from '@/shared/lib/http/types';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ErrorCategory {
  NETWORK = 'network',
  API = 'api',
  VALIDATION = 'validation',
  BUSINESS_LOGIC = 'business_logic',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  CLIENT = 'client',
  SERVER = 'server',
  UNKNOWN = 'unknown',
}

export enum NetworkErrorType {
  TIMEOUT = 'timeout',
  OFFLINE = 'offline',
  CORS = 'cors',
  DNS = 'dns',
  CONNECTION_REFUSED = 'connection_refused',
  UNKNOWN = 'unknown',
}

export enum ApiErrorType {
  BAD_REQUEST = 'bad_request',
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  NOT_FOUND = 'not_found',
  METHOD_NOT_ALLOWED = 'method_not_allowed',
  CONFLICT = 'conflict',
  UNPROCESSABLE_ENTITY = 'unprocessable_entity',
  TOO_MANY_REQUESTS = 'too_many_requests',
  INTERNAL_SERVER_ERROR = 'internal_server_error',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  GATEWAY_TIMEOUT = 'gateway_timeout',
}

export enum ValidationErrorType {
  REQUIRED = 'required',
  MIN_LENGTH = 'min_length',
  MAX_LENGTH = 'max_length',
  PATTERN = 'pattern',
  MIN_VALUE = 'min_value',
  MAX_VALUE = 'max_value',
  TYPE = 'type',
  UNIQUE = 'unique',
  FORMAT = 'format',
  CUSTOM = 'custom',
}

export interface ErrorContext {
  component?: string;
  action?: string;
  data?: Record<string, unknown>;
  componentStack?: string;
}

export interface EnhancedError extends BaseApiError {
  id: string;
  category: ErrorCategory;
  type: string;
  severity: ErrorSeverity;
  timestamp: Date;
  userVisible: boolean;
  handled: boolean;
  context?: ErrorContext;
  suggestedActions?: string[];
  helpLinks?: string[];
  originalError?: unknown;
  stack?: string;
  recovery?: ErrorRecoveryStrategy;
}

export type ErrorHandler = (error: EnhancedError) => void;

export type ErrorTransformer<T extends Error = Error> = (error: T) => EnhancedError;

export interface ErrorRecoveryStrategy {
  shouldAttemptRecovery: boolean;
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  recoveryAction?: () => Promise<boolean>;
}

export interface ErrorNotificationConfig {
  showNotification: boolean;
  title?: string;
  message?: string;
  duration?: number;
  placement?: 'top' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  type?: 'error' | 'warning' | 'info';
}

export interface ErrorLoggingConfig {
  shouldLog: boolean;
  level?: 'debug' | 'info' | 'warn' | 'error';
  context?: Record<string, unknown>;
  includeStack?: boolean;
  sendToMonitoring?: boolean;
}

export interface ErrorHandlingConfig {
  category: ErrorCategory;
  severity: ErrorSeverity;
  userVisible: boolean;
  notification?: ErrorNotificationConfig;
  logging?: ErrorLoggingConfig;
  recovery?: ErrorRecoveryStrategy;
}

export interface ErrorStatistics {
  totalCount: number;
  countByCategory: Record<ErrorCategory, number>;
  countBySeverity: Record<ErrorSeverity, number>;
  topErrors: Array<{
    errorId: string;
    message: string;
    count: number;
    lastOccurred: Date;
  }>;
  trend: Array<{
    date: Date;
    count: number;
    categories: Record<ErrorCategory, number>;
  }>;
}

export interface FieldError {
  field: string;
  message: string;
  type: ValidationErrorType;
  rule?: string;
  suggestion?: string;
}

export interface FormValidationError extends EnhancedError {
  category: ErrorCategory.VALIDATION;
  type: ValidationErrorType;
  fieldErrors: FieldError[];
  generalErrors: string[];
}

export interface NetworkError extends EnhancedError {
  category: ErrorCategory.NETWORK;
  type: NetworkErrorType;
  request?: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: unknown;
  };
  response?: {
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;
    body?: unknown;
  };
}

export interface ApiError extends EnhancedError {
  category: ErrorCategory.API;
  type: ApiErrorType;
  statusCode: number;
  endpoint?: string;
  requestId?: string;
}

export interface BusinessLogicError extends Omit<EnhancedError, 'context'> {
  category: ErrorCategory.BUSINESS_LOGIC;
  type: string;
  rule?: string;
  context?: ErrorContext & {
    expected?: unknown;
    actual?: unknown;
    constraints?: Record<string, unknown>;
  };
}

export function isEnhancedError(error: unknown): error is EnhancedError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'id' in error &&
    'category' in error &&
    'severity' in error &&
    'timestamp' in error
  );
}

export function isNetworkError(error: unknown): error is NetworkError {
  return isEnhancedError(error) && error.category === ErrorCategory.NETWORK;
}

export function isApiError(error: unknown): error is ApiError {
  return isEnhancedError(error) && error.category === ErrorCategory.API;
}

export function isFormValidationError(error: unknown): error is FormValidationError {
  return isEnhancedError(error) && error.category === ErrorCategory.VALIDATION;
}

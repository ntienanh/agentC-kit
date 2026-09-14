import { ErrorCode } from '@shared/enums';

export const DEFAULT_ERROR_TEMPLATES: Partial<Record<ErrorCode, string>> = {
  [ErrorCode.INTERNAL_SERVER_ERROR]:
    'An unexpected internal server error occurred.',
  [ErrorCode.VALIDATION_FAILED]:
    'Input validation failed. Please check the errors array for details.',
  [ErrorCode.BAD_REQUEST]: 'Invalid request parameters provided.',
  [ErrorCode.UNAUTHORIZED]:
    'Authentication is required to access this resource.',
  [ErrorCode.FORBIDDEN]: 'You do not have permission to perform this action.',
  [ErrorCode.RESOURCE_NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCode.ROUTE_NOT_FOUND]: 'The requested endpoint does not exist.',
  [ErrorCode.RATE_LIMIT_EXCEEDED]:
    'Too many requests. Please slow down and try again later.',
  [ErrorCode.OPTIMISTIC_LOCK_CONFLICT]:
    'The record has been updated by another transaction. Please reload.',

  [ErrorCode.USER_ALREADY_EXISTS]:
    "User with email '{email}' already exists in the system.",
  [ErrorCode.USER_NOT_FOUND]:
    "User with identifier '{identifier}' was not found.",
  [ErrorCode.INVALID_CREDENTIALS]: 'Invalid email or password provided.',
  [ErrorCode.USER_INACTIVE]:
    'The user account is currently inactive or suspended.',
  [ErrorCode.TOKEN_EXPIRED]:
    'The authentication token has expired. Please log in again.',
  [ErrorCode.TOKEN_INVALID]:
    'The authentication token is malformed or invalid.',
};

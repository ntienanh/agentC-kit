import { ErrorCode } from '@shared/enums';
import { PaginationMeta } from './pagination-result.type';

export interface ValidationErrorDetail {
  field: string;
  code: string;
  message: string;
}

export interface ApiErrorResponse<TParams = Record<string, unknown>> {
  success: false;
  statusCode: number;
  errorCode: ErrorCode | string;
  message: string;
  params?: TParams;
  errors?: ValidationErrorDetail[];
  timestamp: string;
  path: string;
  correlationId?: string;
  error?: {
    status: number;
    message: string;
    code?: string;
    details?: unknown;
    timestamp?: string;
  };
}

export interface ApiSuccessResponse<TData> {
  success: true;
  statusCode: number;
  data: TData;
  meta?: PaginationMeta;
  message?: string;
  timestamp: string;
  path: string;
}

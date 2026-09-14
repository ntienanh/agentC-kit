import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccessResponse, PaginationResult } from '@shared/types';

function isApiSuccessResponse<T>(data: unknown): data is ApiSuccessResponse<T> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    (data as Record<string, unknown>).success === true &&
    'statusCode' in data &&
    'data' in data
  );
}

function isPaginationResult<T>(data: unknown): data is PaginationResult<T> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'items' in data &&
    Array.isArray((data as Record<string, unknown>).items) &&
    'meta' in data
  );
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiSuccessResponse<unknown>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccessResponse<unknown>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode = response.statusCode || HttpStatus.OK;

    return next.handle().pipe(
      map((data: T): ApiSuccessResponse<unknown> => {
        if (isApiSuccessResponse<unknown>(data)) {
          return data;
        }

        if (isPaginationResult<unknown>(data)) {
          return {
            success: true,
            statusCode,
            data: data.items,
            meta: data.meta,
            timestamp: new Date().toISOString(),
            path: request.url,
          };
        }

        return {
          success: true,
          statusCode,
          data,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }
}

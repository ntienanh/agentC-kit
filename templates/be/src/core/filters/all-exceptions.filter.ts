import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorCode } from '@shared/enums';
import { ApiErrorResponse, ValidationErrorDetail } from '@shared/types';
import { BaseDomainException } from '../exceptions/domain.exception';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode: ErrorCode | string = ErrorCode.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error occurred.';
    let params: Record<string, unknown> | undefined = undefined;
    let validationErrors: ValidationErrorDetail[] | undefined = undefined;

    if (exception instanceof BaseDomainException) {
      statusCode = exception.getStatus();
      errorCode = exception.errorCode;
      message = exception.message;
      params = exception.params;
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resObj = exceptionResponse as Record<string, unknown>;

        if (typeof resObj.errorCode === 'string') {
          errorCode = resObj.errorCode;
        } else {
          errorCode = this.mapHttpStatusToErrorCode(statusCode);
        }

        if (Array.isArray(resObj.errors)) {
          validationErrors = resObj.errors as ValidationErrorDetail[];
          errorCode = ErrorCode.VALIDATION_FAILED;
          message =
            typeof resObj.message === 'string'
              ? resObj.message
              : 'Validation failed.';
        } else if (Array.isArray(resObj.message)) {
          validationErrors = (resObj.message as string[]).map((msg) => ({
            field: 'unknown',
            code: 'INVALID_INPUT',
            message: msg,
          }));
          errorCode = ErrorCode.VALIDATION_FAILED;
          message = 'Validation failed.';
        } else if (typeof resObj.message === 'string') {
          message = resObj.message;
        }
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        errorCode = this.mapHttpStatusToErrorCode(statusCode);
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `[UnhandledException] ${exception.message}`,
        exception.stack,
      );
      message =
        process.env.NODE_ENV === 'production'
          ? 'Internal server error occurred.'
          : exception.message;
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      statusCode,
      errorCode,
      message,
      ...(params ? { params } : {}),
      ...(validationErrors ? { errors: validationErrors } : {}),
      timestamp: new Date().toISOString(),
      path: request.url,
      error: {
        status: statusCode,
        message,
        code: String(errorCode),
        details: validationErrors ?? params,
        timestamp: new Date().toISOString(),
      },
    };

    response.status(statusCode).json(errorResponse);
  }

  private mapHttpStatusToErrorCode(status: number): ErrorCode {
    if (status === 400) return ErrorCode.BAD_REQUEST;
    if (status === 401) return ErrorCode.UNAUTHORIZED;
    if (status === 403) return ErrorCode.FORBIDDEN;
    if (status === 404) return ErrorCode.RESOURCE_NOT_FOUND;
    if (status === 409) return ErrorCode.BAD_REQUEST;
    return ErrorCode.INTERNAL_SERVER_ERROR;
  }
}

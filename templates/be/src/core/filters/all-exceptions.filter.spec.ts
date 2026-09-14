import {
  ArgumentsHost,
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { BaseDomainException } from '../exceptions/domain.exception';
import { ErrorCode } from '@shared/enums';
import { ApiErrorResponse, ValidationErrorDetail } from '@shared/types';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockRequest: Partial<Request>;
  let mockJson: jest.Mock<Response, [ApiErrorResponse]>;
  let mockStatus: jest.Mock<Response, [number]>;
  let mockArgumentsHost: ArgumentsHost;

  const getResponseBody = (): ApiErrorResponse => {
    const callArgs = mockJson.mock.calls[0];
    return callArgs ? callArgs[0] : ({} as ApiErrorResponse);
  };

  beforeEach(() => {
    filter = new AllExceptionsFilter();

    mockRequest = {
      url: '/api/v1/test-endpoint',
    };

    mockJson = jest.fn<Response, [ApiErrorResponse]>().mockReturnThis();
    mockStatus = jest.fn<Response, [number]>().mockReturnThis();

    const mockResponse = {
      status: mockStatus,
      json: mockJson,
    } as unknown as Response;

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    };
  });

  describe('ADR-007 Standard Error Envelope', () => {
    it('should format BaseDomainException with status, errorCode, message, and params', () => {
      const domainException = new BaseDomainException({
        errorCode: ErrorCode.USER_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
        params: { identifier: 'user-123' },
      });

      filter.catch(domainException, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockJson).toHaveBeenCalledTimes(1);

      const responseBody = getResponseBody();
      expect(responseBody.success).toBe(false);
      expect(responseBody.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(responseBody.errorCode).toBe(ErrorCode.USER_NOT_FOUND);
      expect(responseBody.message).toContain('user-123');
      expect(responseBody.params).toEqual({ identifier: 'user-123' });
      expect(responseBody.path).toBe('/api/v1/test-endpoint');
      expect(typeof responseBody.timestamp).toBe('string');
      expect(new Date(responseBody.timestamp).toISOString()).toBe(
        responseBody.timestamp,
      );
    });

    it('should format HttpException with custom errorCode in object response', () => {
      const customHttpException = new HttpException(
        {
          errorCode: 'CUSTOM_BIZ_ERROR',
          message: 'Custom business violation',
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

      filter.catch(customHttpException, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
      const responseBody = getResponseBody();
      expect(responseBody.success).toBe(false);
      expect(responseBody.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      expect(responseBody.errorCode).toBe('CUSTOM_BIZ_ERROR');
      expect(responseBody.message).toBe('Custom business violation');
      expect(responseBody.path).toBe('/api/v1/test-endpoint');
    });

    it('should format HttpException with structured validation errors array (ValidationPipe with custom factory)', () => {
      const validationDetails: ValidationErrorDetail[] = [
        {
          field: 'email',
          code: 'ISEMAIL',
          message: 'Email không đúng định dạng.',
        },
        {
          field: 'password',
          code: 'MINLENGTH',
          message: 'Mật khẩu phải có độ dài tối thiểu 6 ký tự.',
        },
      ];

      const validationException = new BadRequestException({
        errorCode: ErrorCode.VALIDATION_FAILED,
        errors: validationDetails,
      });

      filter.catch(validationException, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      const responseBody = getResponseBody();
      expect(responseBody.success).toBe(false);
      expect(responseBody.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(responseBody.errorCode).toBe(ErrorCode.VALIDATION_FAILED);
      expect(responseBody.message).toBe('Validation failed.');
      expect(responseBody.errors).toEqual(validationDetails);
    });

    it('should format HttpException with string array message (standard NestJS ValidationPipe)', () => {
      const standardValidationException = new BadRequestException({
        statusCode: 400,
        message: [
          'email must be an email',
          'password must be longer than or equal to 6 characters',
        ],
        error: 'Bad Request',
      });

      filter.catch(standardValidationException, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      const responseBody = getResponseBody();
      expect(responseBody.success).toBe(false);
      expect(responseBody.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(responseBody.errorCode).toBe(ErrorCode.VALIDATION_FAILED);
      expect(responseBody.message).toBe('Validation failed.');
      expect(responseBody.errors).toEqual([
        {
          field: 'unknown',
          code: 'INVALID_INPUT',
          message: 'email must be an email',
        },
        {
          field: 'unknown',
          code: 'INVALID_INPUT',
          message: 'password must be longer than or equal to 6 characters',
        },
      ]);
    });

    it('should format HttpException with string response message', () => {
      const stringException = new NotFoundException('Resource was not found');

      filter.catch(stringException, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      const responseBody = getResponseBody();
      expect(responseBody.success).toBe(false);
      expect(responseBody.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(responseBody.errorCode).toBe(ErrorCode.RESOURCE_NOT_FOUND);
      expect(responseBody.message).toBe('Resource was not found');
    });

    it('should map standard HttpStatus codes to appropriate ErrorCodes when no explicit errorCode is given', () => {
      const testCases: {
        exception: HttpException;
        expectedErrorCode: ErrorCode;
      }[] = [
        {
          exception: new BadRequestException('Bad request message'),
          expectedErrorCode: ErrorCode.BAD_REQUEST,
        },
        {
          exception: new UnauthorizedException('Unauthorized message'),
          expectedErrorCode: ErrorCode.UNAUTHORIZED,
        },
        {
          exception: new ForbiddenException('Forbidden message'),
          expectedErrorCode: ErrorCode.FORBIDDEN,
        },
        {
          exception: new NotFoundException('Not found message'),
          expectedErrorCode: ErrorCode.RESOURCE_NOT_FOUND,
        },
        {
          exception: new HttpException('Conflict error', HttpStatus.CONFLICT),
          expectedErrorCode: ErrorCode.BAD_REQUEST,
        },
        {
          exception: new HttpException(
            'Internal error',
            HttpStatus.INTERNAL_SERVER_ERROR,
          ),
          expectedErrorCode: ErrorCode.INTERNAL_SERVER_ERROR,
        },
        {
          exception: new HttpException(
            'Service unavailable',
            HttpStatus.SERVICE_UNAVAILABLE,
          ),
          expectedErrorCode: ErrorCode.INTERNAL_SERVER_ERROR,
        },
      ];

      for (const { exception, expectedErrorCode } of testCases) {
        mockStatus.mockClear();
        mockJson.mockClear();

        filter.catch(exception, mockArgumentsHost);

        const responseBody = getResponseBody();
        expect(responseBody.errorCode).toBe(expectedErrorCode);
      }
    });

    it('should handle unhandled standard JavaScript Error instances', () => {
      const unhandledError = new Error('Database connection timeout');

      filter.catch(unhandledError, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      const responseBody = getResponseBody();
      expect(responseBody.success).toBe(false);
      expect(responseBody.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(responseBody.errorCode).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
      expect(responseBody.message).toBe('Database connection timeout');
      expect(responseBody.path).toBe('/api/v1/test-endpoint');
    });

    it('should handle non-Error primitives and unknown exceptions gracefully', () => {
      const primitiveException = 'String error throw';

      filter.catch(primitiveException, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      const responseBody = getResponseBody();
      expect(responseBody.success).toBe(false);
      expect(responseBody.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(responseBody.errorCode).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
      expect(responseBody.message).toBe('Internal server error occurred.');
    });

    it('should handle null or undefined exceptions gracefully', () => {
      filter.catch(null, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      const responseBody = getResponseBody();
      expect(responseBody.success).toBe(false);
      expect(responseBody.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(responseBody.errorCode).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
    });
  });
});

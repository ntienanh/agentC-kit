import { HttpStatus } from '@nestjs/common';
import { BaseDomainException } from './domain.exception';
import { ErrorCode } from '@shared/enums';

describe('BaseDomainException', () => {
  it('should interpolate template parameters from DEFAULT_ERROR_TEMPLATES', () => {
    const exception = new BaseDomainException({
      errorCode: ErrorCode.USER_ALREADY_EXISTS,
      params: { email: 'test@example.com' },
    });

    expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(exception.errorCode).toBe(ErrorCode.USER_ALREADY_EXISTS);
    expect(exception.params).toEqual({ email: 'test@example.com' });
    expect(exception.message).toContain('test@example.com');
  });

  it('should return template as-is when no params are provided for known template', () => {
    const exception = new BaseDomainException({
      errorCode: ErrorCode.USER_ALREADY_EXISTS,
    });

    expect(exception.message).toContain('{email}');
  });

  it('should humanize error code when no template exists and no params are given', () => {
    const customCode = 'CUSTOM_RESOURCE_INVALID' as ErrorCode;
    const exception = new BaseDomainException({
      errorCode: customCode,
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    });

    expect(exception.getStatus()).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(exception.message).toBe('Custom resource invalid.');
  });

  it('should humanize error code with params details when no template exists', () => {
    const customCode = 'PAYMENT_TRANSACTION_FAILED' as ErrorCode;
    const exception = new BaseDomainException({
      errorCode: customCode,
      params: { txId: 'TX-999', reason: 'Insufficient funds' },
    });

    expect(exception.message).toBe(
      "Payment transaction failed (txId='TX-999', reason='Insufficient funds').",
    );
  });

  it('should preserve explicit custom message if provided', () => {
    const exception = new BaseDomainException({
      errorCode: ErrorCode.VALIDATION_FAILED,
      message: 'Custom explicit error message',
    });

    expect(exception.message).toBe('Custom explicit error message');
  });

  it('should preserve cause error if passed in options', () => {
    const causeError = new Error('Root cause failure');
    const exception = new BaseDomainException({
      errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
      cause: causeError,
    });

    expect(exception.cause).toBe(causeError);
  });
});

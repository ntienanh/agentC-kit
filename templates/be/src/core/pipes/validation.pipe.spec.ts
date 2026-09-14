import { BadRequestException, ValidationPipeOptions } from '@nestjs/common';
import { createValidationPipe } from './validation.pipe';
import { ErrorCode } from '@shared/enums';
import { ValidationError } from 'class-validator';

describe('createValidationPipe', () => {
  it('phải khởi tạo ValidationPipe với cấu trúc exceptionFactory chuẩn', () => {
    const pipe = createValidationPipe();
    expect(pipe).toBeDefined();

    const mockValidationError: ValidationError = {
      property: 'email',
      value: 'invalid-email',
      constraints: {
        isEmail: 'email must be an email',
      },
    };

    const pipeOptions = (
      pipe as unknown as { validatorOptions: ValidationPipeOptions }
    ).validatorOptions;
    expect(pipeOptions).toBeDefined();

    const customPipe = createValidationPipe();
    const exceptionFactory = (
      customPipe as unknown as {
        exceptionFactory: (errors: ValidationError[]) => BadRequestException;
      }
    ).exceptionFactory;

    const exception = exceptionFactory([mockValidationError]);

    expect(exception).toBeInstanceOf(BadRequestException);
    const response = exception.getResponse() as {
      errorCode: string;
      errors: { field: string; code: string; message: string }[];
    };

    expect(response.errorCode).toBe(ErrorCode.VALIDATION_FAILED);
    expect(Array.isArray(response.errors)).toBe(true);
    expect(response.errors[0]).toEqual({
      field: 'email',
      code: 'ISEMAIL',
      message: 'email must be an email',
    });

    const defaultException = (
      customPipe as unknown as {
        exceptionFactory: (errors?: ValidationError[]) => BadRequestException;
      }
    ).exceptionFactory();
    expect(defaultException).toBeInstanceOf(BadRequestException);
  });

  it('phải cho phép ghi đè tùy chọn qua custom options', () => {
    const pipeWithOptions = createValidationPipe({
      disableErrorMessages: true,
    });
    expect(pipeWithOptions).toBeDefined();
  });
});

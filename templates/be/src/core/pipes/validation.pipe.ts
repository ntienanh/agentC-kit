import {
  BadRequestException,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';
import { ErrorCode } from '@shared/enums';
import { flattenValidationErrors } from '@shared/utils';

export function createValidationPipe(
  options?: ValidationPipeOptions,
): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: false,
    },
    stopAtFirstError: false,
    exceptionFactory: (validationErrors = []) => {
      const errors = flattenValidationErrors(validationErrors);

      return new BadRequestException({
        errorCode: ErrorCode.VALIDATION_FAILED,
        errors,
      });
    },
    ...options,
  });
}

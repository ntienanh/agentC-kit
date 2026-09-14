import { ValidationError } from 'class-validator';
import { ValidationErrorDetail } from '@shared/types';

export function flattenValidationErrors(
  validationErrors: ValidationError[],
  parentPath = '',
): ValidationErrorDetail[] {
  const result: ValidationErrorDetail[] = [];

  for (const error of validationErrors) {
    const currentPath = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;

    if (error.constraints) {
      for (const [constraintKey, constraintMessage] of Object.entries(
        error.constraints,
      )) {
        result.push({
          field: currentPath,
          code: constraintKey.toUpperCase(),
          message: constraintMessage,
        });
      }
    }

    if (error.children && error.children.length > 0) {
      const childErrors = flattenValidationErrors(error.children, currentPath);
      result.push(...childErrors);
    }
  }

  return result;
}

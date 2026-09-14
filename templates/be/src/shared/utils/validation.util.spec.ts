import { ValidationError } from 'class-validator';
import { flattenValidationErrors } from './validation.util';

describe('flattenValidationErrors', () => {
  it('should return an empty array when given an empty errors array', () => {
    const result = flattenValidationErrors([]);
    expect(result).toEqual([]);
  });

  it('should flatten top-level validation errors with single or multiple constraints', () => {
    const error1: ValidationError = {
      property: 'email',
      constraints: {
        isEmail: 'email must be an email',
        isNotEmpty: 'email should not be empty',
      },
      children: [],
    };

    const error2: ValidationError = {
      property: 'password',
      constraints: {
        minLength: 'password must be longer than or equal to 6 characters',
      },
      children: [],
    };

    const result = flattenValidationErrors([error1, error2]);

    expect(result).toHaveLength(3);
    expect(result).toContainEqual({
      field: 'email',
      code: 'ISEMAIL',
      message: 'email must be an email',
    });
    expect(result).toContainEqual({
      field: 'email',
      code: 'ISNOTEMPTY',
      message: 'email should not be empty',
    });
    expect(result).toContainEqual({
      field: 'password',
      code: 'MINLENGTH',
      message: 'password must be longer than or equal to 6 characters',
    });
  });

  it('should recursively flatten nested validation errors (e.g. address.city, items.0.price)', () => {
    const nestedError: ValidationError = {
      property: 'address',
      children: [
        {
          property: 'city',
          constraints: {
            isString: 'city must be a string',
            isNotEmpty: 'city should not be empty',
          },
          children: [],
        },
        {
          property: 'zipCode',
          constraints: {
            isPostalCode: 'zipCode must be a postal code',
          },
          children: [],
        },
      ],
    };

    const result = flattenValidationErrors([nestedError]);

    expect(result).toHaveLength(3);
    expect(result).toContainEqual({
      field: 'address.city',
      code: 'ISSTRING',
      message: 'city must be a string',
    });
    expect(result).toContainEqual({
      field: 'address.city',
      code: 'ISNOTEMPTY',
      message: 'city should not be empty',
    });
    expect(result).toContainEqual({
      field: 'address.zipCode',
      code: 'ISPOSTALCODE',
      message: 'zipCode must be a postal code',
    });
  });
});

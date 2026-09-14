export interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'email' | 'number' | 'boolean';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  sanitize?: boolean;
}

export interface ValidationSchema {
  [field: string]: ValidationRule;
}

export interface ValidationError {
  field: string;
  message: string;
  constraint?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const HTML_TAG_REGEX = /<[^>]*>/g;

export class InputValidator {
  sanitize(value: string): string {
    if (typeof value !== 'string') {
      return value;
    }

    let sanitized = value.replace(HTML_TAG_REGEX, '');

    sanitized = sanitized.trim();

    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    return sanitized;
  }

  private validateEmail(value: string): boolean {
    return EMAIL_REGEX.test(value);
  }

  private validateField(field: string, value: unknown, rule: ValidationRule): ValidationError | null {
    if (rule.required && (value === undefined || value === null || value === '')) {
      return {
        field,
        message: `${field} is required`,
        constraint: 'required',
      };
    }

    if (value === undefined || value === null || value === '') {
      return null;
    }

    if (rule.type) {
      if (rule.type === 'email') {
        if (typeof value !== 'string' || !this.validateEmail(value)) {
          return {
            field,
            message: `${field} must be a valid email`,
            constraint: 'email',
          };
        }
      } else if (rule.type === 'string') {
        if (typeof value !== 'string') {
          return {
            field,
            message: `${field} must be a string`,
            constraint: 'type',
          };
        }
      } else if (rule.type === 'number') {
        if (typeof value !== 'number') {
          return {
            field,
            message: `${field} must be a number`,
            constraint: 'type',
          };
        }
      } else if (rule.type === 'boolean') {
        if (typeof value !== 'boolean') {
          return {
            field,
            message: `${field} must be a boolean`,
            constraint: 'type',
          };
        }
      }
    }

    if (rule.minLength !== undefined && typeof value === 'string') {
      if (value.length < rule.minLength) {
        return {
          field,
          message: `${field} must be at least ${rule.minLength} characters`,
          constraint: 'minLength',
        };
      }
    }

    if (rule.maxLength !== undefined && typeof value === 'string') {
      if (value.length > rule.maxLength) {
        return {
          field,
          message: `${field} must be at most ${rule.maxLength} characters`,
          constraint: 'maxLength',
        };
      }
    }

    if (rule.pattern && typeof value === 'string') {
      if (!rule.pattern.test(value)) {
        return {
          field,
          message: `${field} format is invalid`,
          constraint: 'pattern',
        };
      }
    }

    return null;
  }

  validate<T>(data: unknown, schema: ValidationSchema): T {
    if (typeof data !== 'object' || data === null) {
      throw new Error('VALIDATION_ERROR: Data must be an object');
    }

    const payload = data as Record<string, unknown>;
    const errors: ValidationError[] = [];
    const validated: Record<string, unknown> = {};

    for (const [field, rule] of Object.entries(schema)) {
      let value = payload[field];

      if (rule.sanitize && typeof value === 'string') {
        value = this.sanitize(value);
      }

      const error = this.validateField(field, value, rule);
      if (error) {
        errors.push(error);
      } else {
        validated[field] = value;
      }
    }

    const schemaFields = Object.keys(schema);
    const payloadFields = Object.keys(payload);
    const unexpectedFields = payloadFields.filter(field => !schemaFields.includes(field));

    if (unexpectedFields.length > 0) {
      errors.push({
        field: unexpectedFields[0],
        message: `Unexpected field: ${unexpectedFields[0]}`,
        constraint: 'unexpected',
      });
    }

    if (errors.length > 0) {
      const errorMessage = errors.map(e => e.message).join(', ');
      throw new Error(`VALIDATION_ERROR: ${errorMessage}`);
    }

    return validated as T;
  }
}

export const inputValidator = new InputValidator();

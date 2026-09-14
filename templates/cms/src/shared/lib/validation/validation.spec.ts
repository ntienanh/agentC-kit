import { describe, expect, it } from 'vitest';
import { createCookieOptions, isSecureEnvironment } from '../cookies.util';
import { InputValidator } from './input-validator';

describe('InputValidator', () => {
  const validator = new InputValidator();

  it('sanitizes HTML tags and special characters', () => {
    const dirty = '<script>alert("xss")</script> & "quote"';
    const sanitized = validator.sanitize(dirty);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('&amp;');

    expect(validator.sanitize(123 as unknown as string)).toBe(123);
  });

  it('validates valid data according to schema', () => {
    const data = {
      email: 'user@example.com',
      age: 25,
      isActive: true,
      name: 'John Doe',
      patternField: 'ABC-123',
    };

    const schema = {
      email: { required: true, type: 'email' as const },
      age: { type: 'number' as const },
      isActive: { type: 'boolean' as const },
      name: { type: 'string' as const, minLength: 2, maxLength: 50, sanitize: true },
      patternField: { pattern: /^[A-Z]{3}-\d{3}$/ },
    };

    const validated = validator.validate<typeof data>(data, schema);
    expect(validated).toEqual(data);
  });

  it('throws validation error when input fails constraints', () => {
    const schema = {
      email: { required: true, type: 'email' as const },
      name: { type: 'string' as const, minLength: 5, maxLength: 10 },
      patternField: { pattern: /^[0-9]+$/ },
    };

    expect(() => validator.validate({}, schema)).toThrow('VALIDATION_ERROR');
    expect(() => validator.validate({ email: 'invalid-email' }, schema)).toThrow('VALIDATION_ERROR');
    expect(() => validator.validate({ email: 'a@b.com', name: 'A' }, schema)).toThrow('at least 5 characters');
    expect(() => validator.validate({ email: 'a@b.com', name: 'LongNameExceedingLimit' }, schema)).toThrow(
      'at most 10 characters',
    );
    expect(() => validator.validate({ email: 'a@b.com', patternField: 'ABC' }, schema)).toThrow('format is invalid');
    expect(() => validator.validate('not an object', schema)).toThrow('Data must be an object');

    expect(() => validator.validate({ str: 123 }, { str: { type: 'string' as const } })).toThrow(
      'str must be a string',
    );
    expect(() => validator.validate({ num: 'abc' }, { num: { type: 'number' as const } })).toThrow(
      'num must be a number',
    );
    expect(() => validator.validate({ bool: 'yes' }, { bool: { type: 'boolean' as const } })).toThrow(
      'bool must be a boolean',
    );
  });

  it('detects unexpected fields in payload', () => {
    const schema = { name: { type: 'string' as const } };
    expect(() => validator.validate({ name: 'John', unknownProp: 123 }, schema)).toThrow('Unexpected field');
  });
});

describe('cookies.util', () => {
  it('creates cookie options properly', () => {
    const opts = createCookieOptions(true, 3600);
    expect(opts.secure).toBe(true);
    expect(opts.maxAge).toBe(3600);
  });

  it('checks secure environment', () => {
    expect(typeof isSecureEnvironment()).toBe('boolean');
  });
});

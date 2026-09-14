import type { ValidationSchema } from './input-validator';

export const LOGIN_SCHEMA: ValidationSchema = {
  identifier: {
    required: true,
    type: 'string',
    minLength: 1,
    sanitize: true,
  },
  password: {
    required: true,
    type: 'string',
    minLength: 8,
  },
};

export const REGISTER_SCHEMA: ValidationSchema = {
  username: {
    required: true,
    type: 'string',
    minLength: 3,
    maxLength: 50,
    sanitize: true,
  },
  email: {
    required: true,
    type: 'email',
    sanitize: true,
  },
  password: {
    required: true,
    type: 'string',
    minLength: 8,
  },
};

export const CHANGE_PASSWORD_SCHEMA: ValidationSchema = {
  currentPassword: {
    required: true,
    type: 'string',
    minLength: 8,
  },
  newPassword: {
    required: true,
    type: 'string',
    minLength: 8,
  },
  confirmNewPassword: {
    required: true,
    type: 'string',
    minLength: 8,
  },
};

export const RESET_PASSWORD_SCHEMA: ValidationSchema = {
  token: {
    required: true,
    type: 'string',
    minLength: 1,
  },
  newPassword: {
    required: true,
    type: 'string',
    minLength: 8,
  },
};

export const FORGOT_PASSWORD_SCHEMA: ValidationSchema = {
  email: {
    required: true,
    type: 'email',
    sanitize: true,
  },
};

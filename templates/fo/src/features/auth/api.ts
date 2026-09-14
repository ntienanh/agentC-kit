import type { LoginFormValues, RegisterFormValues } from './schema';

export type AuthUser = {
  id: string | number;
  email: string;
  role?: { id: string; name: string; description: string | null; permissions: string[] } | null;
  accessibleStoreIds?: string[];
  emailVerified?: boolean;
};

export type LoginResponse = {
  jwt: string;
  refreshToken: string;
  user: AuthUser;
};

export type ProfileResponse = {
  data?: AuthUser & {
    displayName?: string | null;
    avatar?: string | null;
    phone?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
  message?: string;
  error?: { message?: string };
};

export type RegisterResponse = {
  data?: {
    message?: string;
    key?: string;
  };
  message?: string;
  error?: { message?: string };
};

export function mapRegisterPayload(values: RegisterFormValues) {
  return {
    email: values.email,
    password: values.password,
    role: 'USER',
  };
}

export function mapLoginPayload(values: LoginFormValues) {
  return {
    identifier: values.identifier,
    password: values.password,
  };
}

import { apiFetch } from "@/lib/apiFetch";

import type { LoginResponse, RegisterResponse } from '@/features/auth/api';
import type { ProfileResponse } from '@/features/auth/api';
import type {
  ChangePasswordFormValues,
  ForgotPasswordFormValues,
  LoginFormValues,
  ProfileFormValues,
  RegisterFormValues,
  ResetPasswordFormValues,
  VerifyEmailFormValues,
} from '@/features/auth/schema';

export type ApiClientErrorDetails = {
  status: number;
  requestId?: string;
  recovery?: string[];
  customerContext?: Record<string, unknown>;
  cmsEvidence?: Record<string, unknown>;
};

export class ApiClientError extends Error {
  status: number;
  requestId?: string;
  recovery: string[];
  customerContext?: Record<string, unknown>;
  cmsEvidence?: Record<string, unknown>;

  constructor(message: string, details: ApiClientErrorDetails) {
    super(message);
    this.name = 'ApiClientError';
    this.status = details.status;
    this.requestId = details.requestId;
    this.recovery = details.recovery ?? [];
    this.customerContext = details.customerContext;
    this.cmsEvidence = details.cmsEvidence;
  }
}

async function readJson(response: Response) {
  return response.json().catch(() => null);
}

async function throwIfNotOk(response: Response) {
  if (response.ok) return;
  const json = await readJson(response);
  const error = json?.error ?? json;
  throw new ApiClientError(error?.message || json?.message || 'Request failed.', {
    status: response.status,
    requestId: error?.requestId || json?.requestId || response.headers.get('x-request-id') || undefined,
    recovery: Array.isArray(error?.recovery) ? error.recovery : [],
    customerContext: error?.customerContext,
    cmsEvidence: error?.cmsEvidence,
  });
}

export async function login(payload: LoginFormValues): Promise<LoginResponse> {
  const response = await apiFetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  await throwIfNotOk(response);
  return (await readJson(response)) as LoginResponse;
}

export async function register(payload: RegisterFormValues): Promise<RegisterResponse> {
  const response = await apiFetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  await throwIfNotOk(response);
  return (await readJson(response)) as RegisterResponse;
}

export async function getProfile(token: string): Promise<ProfileResponse> {
  const response = await apiFetch('/api/auth/profile', {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  });
  await throwIfNotOk(response);
  return (await readJson(response)) as ProfileResponse;
}

export async function updateProfile(token: string, payload: ProfileFormValues): Promise<ProfileResponse> {
  const response = await apiFetch('/api/auth/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  await throwIfNotOk(response);
  return (await readJson(response)) as ProfileResponse;
}

export async function changePassword(token: string, payload: ChangePasswordFormValues): Promise<{ data?: { message?: string }; error?: { message?: string } }> {
  const response = await apiFetch('/api/auth/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  await throwIfNotOk(response);
  return (await readJson(response)) as { data?: { message?: string }; error?: { message?: string } };
}

export async function forgotPassword(payload: ForgotPasswordFormValues): Promise<{ data?: { message?: string }; error?: { message?: string } }> {
  const response = await apiFetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  await throwIfNotOk(response);
  return (await readJson(response)) as { data?: { message?: string }; error?: { message?: string } };
}

export async function resetPassword(payload: ResetPasswordFormValues): Promise<{ data?: { message?: string }; error?: { message?: string } }> {
  const response = await apiFetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  await throwIfNotOk(response);
  return (await readJson(response)) as { data?: { message?: string }; error?: { message?: string } };
}

export async function sendEmailVerification(payload: VerifyEmailFormValues): Promise<{ data?: { message?: string }; error?: { message?: string } }> {
  const response = await apiFetch('/api/auth/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  await throwIfNotOk(response);
  return (await readJson(response)) as { data?: { message?: string }; error?: { message?: string } };
}

export async function getSamples(): Promise<{ data?: unknown[] }> {
  const response = await apiFetch('/api/sample', { cache: 'no-store' });
  await throwIfNotOk(response);
  return (await readJson(response)) as { data?: unknown[] };
}

export async function createSample(payload: { title: string; description?: string }): Promise<{ data?: unknown }> {
  const response = await apiFetch('/api/sample', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  await throwIfNotOk(response);
  return (await readJson(response)) as { data?: unknown };
}

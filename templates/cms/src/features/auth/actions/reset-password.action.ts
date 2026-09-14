'use server';

import { AUTH_ERROR_CODES, normalizeApiError } from '@/shared/lib/error';
import { authApi } from '../services/auth.api';

interface ResetPasswordState {
  errorCode?: string;
  success?: boolean;
  message?: string;
}

export async function resetPasswordAction(token: string, newPassword: string): Promise<ResetPasswordState> {
  if (!token?.trim()) {
    return { errorCode: AUTH_ERROR_CODES.RESET_TOKEN_REQUIRED };
  }

  if (!newPassword?.trim()) {
    return { errorCode: AUTH_ERROR_CODES.PASSWORD_REQUIRED };
  }

  if (newPassword.length < 8) {
    return { errorCode: AUTH_ERROR_CODES.PASSWORD_MIN_LENGTH };
  }

  try {
    const res = await authApi.resetPassword({ token, newPassword });
    if (res.error) {
      return {
        errorCode: String(res.error.code ?? AUTH_ERROR_CODES.RESET_PASSWORD_FAILED),
        message: res.error.message,
      };
    }
    return { success: true, message: res.data!.data.message };
  } catch (err: unknown) {
    const normalized = normalizeApiError(err, AUTH_ERROR_CODES.RESET_PASSWORD_FAILED);
    console.error('[ResetPassword] Unexpected error:', normalized);

    if (
      normalized.message.toLowerCase().includes('token') ||
      normalized.code === AUTH_ERROR_CODES.RESET_TOKEN_INVALID
    ) {
      return { errorCode: AUTH_ERROR_CODES.RESET_TOKEN_INVALID };
    }

    return { errorCode: AUTH_ERROR_CODES.RESET_PASSWORD_FAILED };
  }
}

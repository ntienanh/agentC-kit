'use server';

import { AUTH_ERROR_CODES, GENERIC_ERROR_CODES, normalizeApiError } from '@/shared/lib/error';
import { authApi } from '../services/auth.api';

interface ForgotPasswordState {
  errorCode?: string;
  success?: boolean;
}

export async function forgotPasswordAction(email: string): Promise<ForgotPasswordState> {
  if (!email?.trim()) {
    return { errorCode: AUTH_ERROR_CODES.EMAIL_REQUIRED };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { errorCode: AUTH_ERROR_CODES.EMAIL_INVALID };
  }

  try {
    const response = await authApi.forgotPassword({ email: email.trim().toLowerCase() });
    if (response.error) {
      console.error('[ForgotPassword] Error:', normalizeApiError(response.error, GENERIC_ERROR_CODES.UNKNOWN_ERROR));
    }
  } catch (error) {
    console.error('[ForgotPassword] Unexpected error:', normalizeApiError(error, GENERIC_ERROR_CODES.UNKNOWN_ERROR));
  }

  return {
    success: true,
    errorCode: AUTH_ERROR_CODES.FORGOT_PASSWORD_SUCCESS,
  };
}

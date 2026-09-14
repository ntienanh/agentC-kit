import { getTranslations } from 'next-intl/server';
import type { ErrorCode } from './error-codes';
import { ERROR_CODES } from './error-codes';

export async function getErrorMessage(errorCode: ErrorCode, locale?: string): Promise<string> {
  try {
    const t = locale ? await getTranslations({ locale, namespace: 'error' }) : await getTranslations('error');
    return t(errorCode);
  } catch {
    return errorCode;
  }
}

export function getErrorMessageClient(errorCode: ErrorCode, t: (key: string) => string): string {
  try {
    return t(errorCode);
  } catch {
    return errorCode;
  }
}

export function isValidErrorCode(code: string): code is ErrorCode {
  return Object.values(ERROR_CODES).includes(code as ErrorCode);
}

export function extractErrorCode(error: unknown): ErrorCode {
  if (typeof error === 'object' && error !== null) {
    const err = error as { code?: string; errorCode?: string };
    const code = err.code || err.errorCode;

    if (code && isValidErrorCode(code)) {
      return code;
    }
  }

  return ERROR_CODES.UNKNOWN_ERROR;
}

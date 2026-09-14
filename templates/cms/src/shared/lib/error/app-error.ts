export interface AppErrorLike {
  code?: string | number;
  message?: string;
  details?: unknown;
  error?: {
    code?: string | number;
    message?: string;
  };
}

export class AppError extends Error {
  code: string;
  details?: unknown;

  constructor(code: string, message?: string, details?: unknown) {
    super(message ?? code);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

export function toAppError(error: unknown, fallbackCode = 'UNKNOWN_ERROR'): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof Error) return new AppError(fallbackCode, error.message);
  if (typeof error === 'object' && error !== null) {
    const source = error as AppErrorLike;
    return new AppError(String(source.code ?? fallbackCode), source.message, source.details);
  }
  return new AppError(fallbackCode);
}

export function normalizeApiError(
  error: unknown,
  fallbackCode = 'UNKNOWN_ERROR',
): { code: string; message: string; details?: unknown } {
  const appError = toAppError(error, fallbackCode);
  const normalizedCode = appError.code?.trim() ? appError.code : fallbackCode;
  const normalizedMessage = appError.message?.trim() ? appError.message : normalizedCode;

  return {
    code: normalizedCode,
    message: normalizedMessage,
    details: appError.details,
  };
}

export function resolveErrorMessage(
  error: unknown,
  tError: (key: string) => string,
  fallbackCode = 'UNKNOWN_ERROR',
): string {
  const appError = toAppError(error, fallbackCode);

  const candidates = extractErrorCodeCandidates(error, appError);
  for (const candidate of candidates) {
    const translated = translateErrorIfExists(candidate, tError);
    if (translated) return translated;
  }

  if (isHumanReadableMessage(appError.message)) {
    return appError.message;
  }

  return tError(fallbackCode);
}

export function showErrorMessage(
  messageApi: { error: (content: string) => void },
  error: unknown,
  tError: (key: string) => string,
  fallbackCode = 'UNKNOWN_ERROR',
): void {
  messageApi.error(resolveErrorMessage(error, tError, fallbackCode));
}

function extractErrorCodeCandidates(error: unknown, appError: AppError): string[] {
  const raw = error as AppErrorLike | undefined;
  const candidates = [
    appError.code,
    appError.message,
    typeof raw?.code === 'string' ? raw.code : undefined,
    typeof raw?.message === 'string' ? raw.message : undefined,
    typeof raw?.error?.code === 'string' ? raw.error.code : undefined,
    typeof raw?.error?.message === 'string' ? raw.error.message : undefined,
  ].filter((value): value is string => Boolean(value));

  return Array.from(new Set(candidates));
}

function translateErrorIfExists(candidate: string, tError: (key: string) => string): string | null {
  const normalized = normalizeErrorCode(candidate);

  for (const key of [candidate, normalized]) {
    try {
      const translated = tError(key);
      if (translated && translated !== key) return translated;
    } catch {
      continue;
    }
  }

  return null;
}

function normalizeErrorCode(value: string): string {
  return value.trim().replace(/\s+/g, '_').replace(/-/g, '_').toUpperCase();
}

function isHumanReadableMessage(value?: string): value is string {
  if (!value) return false;
  const normalized = value.trim();
  if (!normalized) return false;

  if (/^[A-Z0-9_]+$/.test(normalized)) return false;
  if (/^[a-z0-9_]+$/.test(normalized)) return false;

  return true;
}

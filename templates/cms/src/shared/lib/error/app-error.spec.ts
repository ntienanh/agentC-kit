import { describe, expect, it, vi } from 'vitest';
import { AppError, normalizeApiError, resolveErrorMessage, showErrorMessage, toAppError } from './app-error';
import { ERROR_CODES } from './error-codes';
import { extractErrorCode, getErrorMessage, getErrorMessageClient, isValidErrorCode } from './get-error-message';

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockImplementation(async opts => {
    if (typeof opts === 'object' && opts?.locale === 'invalid') {
      throw new Error('Locale error');
    }
    return (key: string) => (key === ERROR_CODES.UNAUTHORIZED ? 'Authentication Required' : key);
  }),
}));

describe('app-error', () => {
  it('instantiates AppError correctly', () => {
    const err = new AppError('ERR_001', 'Custom message', { detail: 123 });
    expect(err.name).toBe('AppError');
    expect(err.code).toBe('ERR_001');
    expect(err.message).toBe('Custom message');
    expect(err.details).toEqual({ detail: 123 });

    const defaultMsgErr = new AppError('ERR_002');
    expect(defaultMsgErr.message).toBe('ERR_002');
  });

  it('converts unknown values to AppError using toAppError', () => {
    const existing = new AppError('EXISTING');
    expect(toAppError(existing)).toBe(existing);

    const stdErr = new Error('Standard error message');
    const convertedStd = toAppError(stdErr, 'FALLBACK');
    expect(convertedStd.code).toBe('FALLBACK');
    expect(convertedStd.message).toBe('Standard error message');

    const objErr = { code: 'OBJ_CODE', message: 'Obj Message', details: 'info' };
    const convertedObj = toAppError(objErr);
    expect(convertedObj.code).toBe('OBJ_CODE');
    expect(convertedObj.message).toBe('Obj Message');
    expect(convertedObj.details).toBe('info');

    const primitiveErr = toAppError(12345, 'FALLBACK');
    expect(primitiveErr.code).toBe('FALLBACK');
  });

  it('normalizes API errors via normalizeApiError', () => {
    const res1 = normalizeApiError(new AppError('CODE_1', 'Message 1'), 'FALLBACK');
    expect(res1).toEqual({ code: 'CODE_1', message: 'Message 1', details: undefined });

    const res2 = normalizeApiError({ code: '  ', message: '   ' }, 'FALLBACK');
    expect(res2).toEqual({ code: 'FALLBACK', message: 'FALLBACK', details: undefined });
  });

  it('resolves error messages using resolveErrorMessage', () => {
    const tError = (key: string) => {
      if (key === 'UNAUTHORIZED') return 'Authentication Required';
      if (key === 'user_not_found') return 'User Not Found';
      return key;
    };

    const res1 = resolveErrorMessage(new AppError('UNAUTHORIZED', 'UNAUTHORIZED'), tError);
    expect(res1).toBe('Authentication Required');

    const res2 = resolveErrorMessage(new AppError('user_not_found', 'user_not_found'), tError);
    expect(res2).toBe('User Not Found');

    const humanReadable = resolveErrorMessage(new Error('Something failed in UI'), tError);
    expect(humanReadable).toBe('Something failed in UI');

    const fallbackRes = resolveErrorMessage({ code: 'UNKNOWN_CODE' }, tError, 'FALLBACK_CODE');
    expect(fallbackRes).toBe('FALLBACK_CODE');

    const tErrorThrowing = (key: string) => {
      if (key === 'THROW_CODE') throw new Error('Translation failed');
      return 'Translated Fallback';
    };
    const throwingRes = resolveErrorMessage(new AppError('THROW_CODE', 'THROW_CODE'), tErrorThrowing, 'DEFAULT');
    expect(throwingRes).toBe('Translated Fallback');
  });

  it('triggers showErrorMessage correctly', () => {
    const messageApi = { error: vi.fn() };
    const tError = (key: string) => (key === 'ERR' ? 'Translated Err' : key);
    showErrorMessage(messageApi, new AppError('ERR', 'ERR'), tError);
    expect(messageApi.error).toHaveBeenCalledWith('Translated Err');
  });
});

describe('get-error-message', () => {
  it('translates error message on server-side via getErrorMessage', async () => {
    const msg1 = await getErrorMessage(ERROR_CODES.UNAUTHORIZED);
    expect(msg1).toBe('Authentication Required');

    const msg2 = await getErrorMessage(ERROR_CODES.UNAUTHORIZED, 'en');
    expect(msg2).toBe('Authentication Required');

    const msgFail = await getErrorMessage(ERROR_CODES.UNAUTHORIZED, 'invalid');
    expect(msgFail).toBe(ERROR_CODES.UNAUTHORIZED);
  });

  it('translates error message on client-side via getErrorMessageClient', () => {
    const t = (key: string) => (key === ERROR_CODES.UNAUTHORIZED ? 'Client Auth Req' : key);
    expect(getErrorMessageClient(ERROR_CODES.UNAUTHORIZED, t)).toBe('Client Auth Req');

    const tFail = () => {
      throw new Error('t error');
    };
    expect(getErrorMessageClient(ERROR_CODES.UNAUTHORIZED, tFail)).toBe(ERROR_CODES.UNAUTHORIZED);
  });

  it('validates error codes via isValidErrorCode', () => {
    expect(isValidErrorCode(ERROR_CODES.UNAUTHORIZED)).toBe(true);
    expect(isValidErrorCode('INVALID_CODE_XYZ')).toBe(false);
  });

  it('extracts error codes via extractErrorCode', () => {
    expect(extractErrorCode({ code: ERROR_CODES.UNAUTHORIZED })).toBe(ERROR_CODES.UNAUTHORIZED);
    expect(extractErrorCode({ errorCode: ERROR_CODES.UNAUTHORIZED })).toBe(ERROR_CODES.UNAUTHORIZED);
    expect(extractErrorCode({ code: 'NON_EXISTENT' })).toBe(ERROR_CODES.UNKNOWN_ERROR);
    expect(extractErrorCode(null)).toBe(ERROR_CODES.UNKNOWN_ERROR);
  });
});

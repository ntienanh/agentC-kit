import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_EVENT_TYPES, AUTH_SIGNOUT_REASONS, logAuthEvent } from './auth-event';

describe('logAuthEvent', () => {
  const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);

  beforeEach(() => {
    infoSpy.mockClear();
  });

  afterEach(() => {
    infoSpy.mockClear();
  });

  it('logs structured auth event payload', () => {
    logAuthEvent(AUTH_EVENT_TYPES.FORCED_SIGNOUT, {
      reason: AUTH_SIGNOUT_REASONS.REFRESH_FAILED,
      status: 401,
      errorCode: 'AUTH_TOKEN_EXPIRED',
      route: '/vi/dashboard',
      context: 'scheduled_refresh_failed',
    });

    expect(infoSpy).toHaveBeenCalledTimes(1);

    const raw = infoSpy.mock.calls[0][0];
    expect(typeof raw).toBe('string');

    const parsed = JSON.parse(raw as string) as Record<string, unknown>;
    expect(parsed.level).toBe('info');
    expect(parsed.type).toBe(AUTH_EVENT_TYPES.FORCED_SIGNOUT);
    expect(parsed.reason).toBe(AUTH_SIGNOUT_REASONS.REFRESH_FAILED);
    expect(parsed.status).toBe(401);
    expect(parsed.errorCode).toBe('AUTH_TOKEN_EXPIRED');
    expect(parsed.route).toBe('/vi/dashboard');
    expect(parsed.context).toBe('scheduled_refresh_failed');
    expect(typeof parsed.timestamp).toBe('string');
  });

  it('does not throw when console.info throws', () => {
    infoSpy.mockImplementationOnce(() => {
      throw new Error('logger down');
    });

    expect(() => {
      logAuthEvent(AUTH_EVENT_TYPES.REFRESH_FAILED, {
        reason: AUTH_SIGNOUT_REASONS.REFRESH_FAILED,
      });
    }).not.toThrow();
  });
});

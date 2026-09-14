import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiClientError, login } from './api-client';

describe('api-client error envelope', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws a safe FO error with CMS recovery context', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            message: 'Session expired.',
            requestId: 'req-fo-auth-001',
            recovery: ['Retry login', 'Contact support with request id'],
            customerContext: { email: 'customer@example.com' },
            cmsEvidence: { queue: 'auth-session-review' },
          },
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    await expect(login({ identifier: 'customer@example.com', password: 'bad-secret' })).rejects.toMatchObject({
      name: 'ApiClientError',
      message: 'Session expired.',
      status: 401,
      requestId: 'req-fo-auth-001',
      recovery: ['Retry login', 'Contact support with request id'],
      customerContext: { email: 'customer@example.com' },
      cmsEvidence: { queue: 'auth-session-review' },
    });
  });

  it('keeps request id from response headers when body omits it', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: { message: 'Unexpected auth error.' } }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'x-request-id': 'req-header-only' },
      }),
    );

    try {
      await login({ identifier: 'customer@example.com', password: 'bad-secret' });
      throw new Error('Expected login to fail.');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiClientError);
      expect(error).toMatchObject({
        message: 'Unexpected auth error.',
        requestId: 'req-header-only',
        recovery: [],
      });
    }
  });
});

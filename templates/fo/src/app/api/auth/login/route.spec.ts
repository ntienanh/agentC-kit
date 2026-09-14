import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('forwards login to backend api/v1/auth/login endpoint', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            accessToken: 'token',
            refreshToken: 'refresh',
            user: { id: 'uuid-1', email: 'customer@example.com' },
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    const request = new Request('http://localhost:3848/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'customer@example.com', password: 'secret123' }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:4000/api/v1/auth/login',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(json.jwt).toBe('token');
    expect(json.accessToken).toBe('token');
    expect(json.meta.continuity).toEqual({
      scope: 'fo-auth-login',
      email: 'customer@example.com',
      downstream: ['profile'],
    });
  });
});

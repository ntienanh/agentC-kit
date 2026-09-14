import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('forwards registration to backend auth/register endpoint', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({ data: { message: 'User registered successfully.' } }), { status: 201, headers: { 'Content-Type': 'application/json' } }));
    const request = new Request('http://localhost:3848/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'customer@example.com', password: 'secret123', confirmPassword: 'secret123' }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:4000/api/v1/auth/register',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(json.data.message).toBe('User registered successfully.');
    expect(json.meta.continuity).toEqual({
      scope: 'fo-auth-register',
      identifier: 'customer@example.com',
      downstream: ['verify-email', 'login', 'profile'],
    });
  });
});

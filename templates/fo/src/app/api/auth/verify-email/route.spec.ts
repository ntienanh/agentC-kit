import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

describe('/api/auth/verify-email', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('validates email before proxying verification requests', async () => {
    const response = await POST(new Request('http://localhost:3848/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email' }),
    }));

    expect(response.status).toBe(400);
  });

  it('proxies verification requests and returns CMS reconciliation anchors', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({ data: { message: 'sent' } }), { status: 202, headers: { 'Content-Type': 'application/json' } }));

    const response = await POST(new Request('http://localhost:3848/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'customer@example.com' }),
    }));
    const data = await response.json();

    expect(response.status).toBe(202);
    expect(fetchSpy).toHaveBeenCalledWith('http://localhost:4000/api/v1/auth/verify-email', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ email: 'customer@example.com' }),
    }));
    expect(data.meta?.continuity).toEqual({
      scope: 'fo-auth-verify-email',
      downstream: ['login', 'profile'],
    });
  });
});

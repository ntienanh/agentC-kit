import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

describe('POST /api/auth/reset-password', () => {
  beforeEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

  it('validates password confirmation before proxying', async () => {
    const response = await POST(new Request('http://localhost:3848/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: 'abc', newPassword: 'Password1', confirmPassword: 'Password2' }) }));
    expect(response.status).toBe(400);
  });

  it('adds recovery continuity contract to reset responses', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({ data: { message: 'reset' } }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    const response = await POST(new Request('http://localhost:3848/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-request-id': 'req-reset-1' }, body: JSON.stringify({ token: 'abc', newPassword: 'Password1', confirmPassword: 'Password1' }) }));
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalledWith('http://localhost:4000/api/v1/auth/reset-password', expect.objectContaining({ method: 'POST' }));
    expect(data.meta?.continuity).toEqual(expect.objectContaining({
      scope: 'fo-auth-reset-password',
      requestId: 'req-reset-1',
      authenticated: false,
    }));
  });
});

import { describe, expect, it, vi } from 'vitest';
import { POST } from './route';

describe('/api/auth/change-password', () => {
  it('validates password confirmation before proxying', async () => {
    const response = await POST(new Request('http://localhost:3848/api/auth/change-password', { method: 'POST', headers: { Authorization: 'Bearer token', 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: 'oldpass', newPassword: 'newpass', confirmNewPassword: 'wrong' }) }));
    expect(response.status).toBe(400);
  });

  it('proxies password changes with bearer token', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({ data: { message: 'ok' } }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    const response = await POST(new Request('http://localhost:3848/api/auth/change-password', { method: 'POST', headers: { Authorization: 'Bearer token', 'Content-Type': 'application/json', 'x-request-id': 'req-change-1' }, body: JSON.stringify({ currentPassword: 'oldpass', newPassword: 'newpass', confirmNewPassword: 'newpass' }) }));
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalledWith('http://localhost:4000/api/v1/auth/change-password', expect.objectContaining({ method: 'POST', headers: expect.objectContaining({ Authorization: 'Bearer token' }) }));
    expect(data.meta?.continuity).toEqual(expect.objectContaining({
      scope: 'fo-auth-change-password',
      requestId: 'req-change-1',
      authenticated: true,
    }));
  });
});

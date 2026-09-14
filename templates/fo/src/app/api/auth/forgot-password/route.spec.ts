import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

describe('POST /api/auth/forgot-password', () => {
  beforeEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

  it('proxies forgot-password request to backend', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({ data: { message: 'sent' } }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    const response = await POST(new Request('http://localhost:3848/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-request-id': 'req-forgot-1' }, body: JSON.stringify({ email: 'customer@example.com' }) }));
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalledWith('http://localhost:4000/api/v1/auth/forgot-password', expect.objectContaining({ method: 'POST' }));
    expect(data.meta?.continuity).toEqual(expect.objectContaining({
      scope: 'fo-auth-forgot-password',
      requestId: 'req-forgot-1',
      cmsSupportLookup: expect.objectContaining({ recoveryStatusKey: 'recovery:req-forgot-1' }),
    }));
  });
});

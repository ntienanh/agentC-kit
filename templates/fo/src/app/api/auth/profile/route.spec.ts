import { describe, expect, it, vi } from 'vitest';
import { GET, PUT } from './route';

describe('/api/auth/profile', () => {
  it('proxies profile read with bearer token', async () => {
    const mockData = {
      data: {
        id: 1,
        email: 'A@Example.COM',
        phone: '0909000111',
        displayName: 'Customer A',
        accessibleStoreIds: ['store-a'],
        membershipStatus: 'active',
      },
    };
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const response = await GET(
      new Request('http://localhost:3848/api/auth/profile', {
        headers: { Authorization: 'Bearer token' },
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:4000/api/v1/auth/profile',
      expect.objectContaining({ headers: { Authorization: 'Bearer token' } }),
    );
    expect(json).toEqual(mockData);
  });

  it('proxies profile update without injecting synthetic metadata', async () => {
    const mockData = {
      data: { id: 2, email: 'customer@example.com', displayName: 'Customer Updated' },
    };
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const response = await PUT(
      new Request('http://localhost:3848/api/auth/profile', {
        method: 'PUT',
        headers: { Authorization: 'Bearer token', 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: 'Customer Updated', phone: '0909000222' }),
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual(mockData);
  });

  it('validates profile update before proxying', async () => {
    const response = await PUT(
      new Request('http://localhost:3848/api/auth/profile', {
        method: 'PUT',
        headers: { Authorization: 'Bearer token', 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: 'x'.repeat(101) }),
      }),
    );
    expect(response.status).toBe(400);
  });

  it('handles upstream network failure gracefully with 503', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new TypeError('fetch failed'));
    const response = await GET(
      new Request('http://localhost:3848/api/auth/profile', {
        headers: { Authorization: 'Bearer token' },
      }),
    );
    expect(response.status).toBe(503);
    const json = await response.json();
    expect(json.error.code).toBe('UPSTREAM_UNAVAILABLE');
  });
});


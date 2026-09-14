import { describe, expect, it, vi } from 'vitest';
import { createRefreshSingleFlight } from './auth-refresh-singleflight';

describe('createRefreshSingleFlight', () => {
  it('coalesces concurrent calls into one execution', async () => {
    const execute = vi.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
      return { accessToken: 'token', expiresIn: 60 };
    });

    const refresh = createRefreshSingleFlight(execute);

    const [r1, r2, r3] = await Promise.all([refresh(), refresh(), refresh()]);

    expect(execute).toHaveBeenCalledTimes(1);
    expect(r1).toEqual(r2);
    expect(r2).toEqual(r3);
  });

  it('allows next execution after previous settles', async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce({ accessToken: 'token-1', expiresIn: 60 })
      .mockResolvedValueOnce({ accessToken: 'token-2', expiresIn: 120 });

    const refresh = createRefreshSingleFlight(execute);

    const first = await refresh();
    const second = await refresh();

    expect(execute).toHaveBeenCalledTimes(2);
    expect(first?.accessToken).toBe('token-1');
    expect(second?.accessToken).toBe('token-2');
  });
});

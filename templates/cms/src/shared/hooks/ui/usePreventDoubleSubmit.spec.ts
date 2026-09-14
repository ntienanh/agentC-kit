import { describe, expect, it, vi } from 'vitest';
import { DoubleSubmitLock } from './usePreventDoubleSubmit';

describe('DoubleSubmitLock', () => {
  it('executes submit function when unlocked and manages locked state', async () => {
    const lock = new DoubleSubmitLock();
    expect(lock.locked).toBe(false);

    let resolvePromise: (val: string) => void = () => {};
    const mockSubmit = vi.fn(
      () =>
        new Promise<string>(resolve => {
          resolvePromise = resolve;
        }),
    );

    const firstExecution = lock.execute(mockSubmit);
    expect(lock.locked).toBe(true);

    const secondExecution = await lock.execute(mockSubmit);
    expect(secondExecution).toBeUndefined();
    expect(mockSubmit).toHaveBeenCalledTimes(1);

    resolvePromise('done');
    const result = await firstExecution;
    expect(result).toBe('done');
    expect(lock.locked).toBe(false);

    const thirdExecution = await lock.execute(async () => 'next');
    expect(thirdExecution).toBe('next');
  });

  it('resets locked state when submitted function throws an error', async () => {
    const lock = new DoubleSubmitLock();
    const failingSubmit = vi.fn().mockRejectedValue(new Error('Network failure'));

    await expect(lock.execute(failingSubmit)).rejects.toThrow('Network failure');
    expect(lock.locked).toBe(false);
  });
});

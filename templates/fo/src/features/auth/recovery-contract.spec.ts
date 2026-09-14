import { describe, expect, it } from 'vitest';
import { buildRecoveryContinuityMeta, withRecoveryContinuityMeta } from './recovery-contract';

describe('recovery contract', () => {
  it('builds forgot-password continuity with cms support lookup', () => {
    expect(buildRecoveryContinuityMeta({ step: 'forgot-password', email: 'customer@example.com', requestId: 'req-1' })).toEqual(expect.objectContaining({
      scope: 'fo-auth-forgot-password',
      step: 'forgot-password',
      email: 'customer@example.com',
      requestId: 'req-1',
      authenticated: false,
      cmsSupportLookup: expect.objectContaining({
        customerIdentity: { email: 'customer@example.com' },
        recoveryStatusKey: 'recovery:req-1',
      }),
      downstream: expect.arrayContaining(['reset-password', 'support-follow-up']),
    }));
  });

  it('merges continuity meta into existing payload meta', () => {
    const result = withRecoveryContinuityMeta({ data: { ok: true }, meta: { trace: 'abc' } }, { step: 'change-password', authenticated: true });
    expect(result).toMatchObject({
      data: { ok: true },
      meta: {
        trace: 'abc',
        continuity: {
          scope: 'fo-auth-change-password',
          authenticated: true,
          cmsSupportLookup: {
            recoveryStatusKey: 'recovery:change-password',
          },
        },
      },
    });
  });
});

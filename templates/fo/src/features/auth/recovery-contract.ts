export type RecoveryStep = 'forgot-password' | 'reset-password' | 'change-password';

type RecoveryContinuityInput = {
  step: RecoveryStep;
  email?: string;
  requestId?: string | null;
  authenticated?: boolean;
};

const recoveryDownstreamByStep: Record<RecoveryStep, string[]> = {
  'forgot-password': ['reset-password', 'login', 'support-follow-up', 'cms-customer-reconciliation'],
  'reset-password': ['login', 'account', 'profile', 'dashboard', 'cms-customer-reconciliation'],
  'change-password': ['profile-page', 'account-security', 'login-recovery', 'cms-customer-reconciliation'],
};

export function buildRecoveryContinuityMeta(input: RecoveryContinuityInput) {
  return {
    scope: `fo-auth-${input.step}`,
    step: input.step,
    email: input.email ?? null,
    requestId: input.requestId ?? null,
    authenticated: input.authenticated ?? input.step === 'change-password',
    cmsSupportLookup: {
      customerIdentity: input.email ? { email: input.email } : { email: null },
      recoveryStatusKey: input.requestId ? `recovery:${input.requestId}` : `recovery:${input.step}`,
      operatorAction: 'support-customer-recovery',
    },
    errorEnvelope: { error: { message: 'string' } },
    downstream: recoveryDownstreamByStep[input.step],
  };
}

export function withRecoveryContinuityMeta(payload: unknown, input: RecoveryContinuityInput) {
  const base = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {};
  return {
    ...base,
    meta: {
      ...(base.meta && typeof base.meta === 'object' ? base.meta as Record<string, unknown> : {}),
      continuity: buildRecoveryContinuityMeta(input),
    },
  };
}

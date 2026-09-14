import { describe, expect, it } from 'vitest';
import { isMvpProtectedFoRoute, MVP_PROTECTED_FO_ROUTES, resolveMvpFoRouteGate } from './rbac-mvp-contract';

describe('MVP RBAC FO contract', () => {
  it('marks customer account routes as protected by an authenticated FO session', () => {
    expect(MVP_PROTECTED_FO_ROUTES).toEqual([
      { id: 'profile', href: '/profile', requires: 'customer-session', guestFallback: 'login-required' },
    ]);
  });

  it('allows smoke checks to distinguish protected and public FO routes', () => {
    expect(isMvpProtectedFoRoute('/profile')).toBe(true);
    expect(isMvpProtectedFoRoute('/account')).toBe(false);
    expect(isMvpProtectedFoRoute('/services')).toBe(false);
    expect(isMvpProtectedFoRoute('/blog')).toBe(false);
  });

  it('defines denied and allowed outcomes for protected route smoke gates', () => {
    expect(resolveMvpFoRouteGate('/profile', false)).toBe('login-required');
    expect(resolveMvpFoRouteGate('/profile', true)).toBe('allowed');
    expect(resolveMvpFoRouteGate('/services', false)).toBe('public');
  });
});

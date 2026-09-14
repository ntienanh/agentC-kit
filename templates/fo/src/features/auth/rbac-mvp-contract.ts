export type MvpProtectedFoRoute = {
  readonly id: string;
  readonly href: string;
  readonly requires: 'customer-session';
  readonly guestFallback: 'login-required';
};

export const MVP_PROTECTED_FO_ROUTES = [
  { id: 'profile', href: '/profile', requires: 'customer-session', guestFallback: 'login-required' },
] as const satisfies readonly MvpProtectedFoRoute[];

export function isMvpProtectedFoRoute(href: string): boolean {
  return MVP_PROTECTED_FO_ROUTES.some(route => route.href === href);
}

export function resolveMvpFoRouteGate(href: string, hasSession: boolean): 'allowed' | 'login-required' | 'public' {
  if (!isMvpProtectedFoRoute(href)) return 'public';

  return hasSession ? 'allowed' : 'login-required';
}

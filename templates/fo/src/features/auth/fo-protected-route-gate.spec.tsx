import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FoProtectedRouteGate } from './fo-protected-route-gate';

describe('FoProtectedRouteGate', () => {
  it('shows login-required fallback for protected guest routes', () => {
    const html = renderToStaticMarkup(
      <FoProtectedRouteGate href='/profile' session={null}>
        <div>Secret profile content</div>
      </FoProtectedRouteGate>,
    );

    expect(html).toContain('Protected customer route');
    expect(html).toContain('href="/login?next=%2Fprofile"');
    expect(html).toContain('href="/register?next=%2Fprofile"');
    expect(html).not.toContain('Secret profile content');
  });

  it('renders children for protected routes with a session', () => {
    const html = renderToStaticMarkup(
      <FoProtectedRouteGate href='/profile' session={{ jwt: 'token', refreshToken: 'refresh-token', user: { id: 1, email: 'user@example.com' } }}>
        <div>Secret profile content</div>
      </FoProtectedRouteGate>,
    );

    expect(html).toContain('Secret profile content');
  });

  it('renders children for public routes without a session', () => {
    const html = renderToStaticMarkup(
      <FoProtectedRouteGate href='/services' session={null}>
        <div>Public content</div>
      </FoProtectedRouteGate>,
    );

    expect(html).toContain('Public content');
  });
});

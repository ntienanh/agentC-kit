import { describe, expect, it } from 'vitest';
import { buildAuthContinuationHref, resolveAuthContinuation } from './auth-continuation';

describe('auth continuation', () => {
  it('preserves an internal return path', () => {
    expect(resolveAuthContinuation('/profile?autoload=1')).toBe('/profile?autoload=1');
    expect(buildAuthContinuationHref('/login', '/profile?autoload=1')).toBe('/login?next=%2Fprofile%3Fautoload%3D1');
  });

  it('falls back to the profile page for unsafe return paths', () => {
    expect(resolveAuthContinuation('https://example.com')).toBe('/profile');
    expect(resolveAuthContinuation('//example.com')).toBe('/profile');
  });
});

import { describe, expect, it } from 'vitest';
import { buildFrontOfficeHref, getConfiguredFrontOfficeHref, normalizeFrontOfficeBaseUrl } from './front-office-url';

describe('front-office-url', () => {
  it('normalizes valid front office base urls', () => {
    expect(normalizeFrontOfficeBaseUrl('https://example.com')).toBe('https://example.com/');
    expect(normalizeFrontOfficeBaseUrl('http://localhost:3000/app/')).toBe('http://localhost:3000/app/');
    expect(normalizeFrontOfficeBaseUrl('ftp://invalid.com')).toBeNull();
    expect(normalizeFrontOfficeBaseUrl('invalid-url')).toBeNull();
  });

  it('builds safe front office hrefs', () => {
    const base = 'https://example.com/app';
    expect(buildFrontOfficeHref(base, '/items/1')).toBe('https://example.com/app/items/1');
    expect(buildFrontOfficeHref(base, 'https://malicious.com')).toBeNull();
  });

  it('gets configured front office href', () => {
    const href = getConfiguredFrontOfficeHref('/test');
    expect(href === null || typeof href === 'string').toBe(true);
  });
});

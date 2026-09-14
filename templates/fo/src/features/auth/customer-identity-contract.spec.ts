import { describe, expect, it } from 'vitest';
import { buildFoCustomerIdentityContract } from './customer-identity-contract';

describe('MVP customer identity FO contract', () => {
  it('maps authenticated profile fields into a CMS Customer 360 lookup anchor', () => {
    expect(buildFoCustomerIdentityContract({
      id: 42,
      email: ' Customer@Example.COM ',
      phone: ' 0909000111 ',
      displayName: ' Customer One ',
      accessibleStoreIds: ['store-a', 'store-b'],
      membershipStatus: 'active',
      createdAt: '2026-06-10T10:00:00.000Z',
      updatedAt: '2026-06-11T10:00:00.000Z',
    })).toEqual({
      customerId: '42',
      email: 'customer@example.com',
      phone: '0909000111',
      displayName: 'Customer One',
      storeScope: ['store-a', 'store-b'],
      membershipStatus: 'active',
      profileStatus: 'complete',
      createdAt: '2026-06-10T10:00:00.000Z',
      updatedAt: '2026-06-11T10:00:00.000Z',
      cmsLookup: { route: '/users', search: 'customer@example.com' },
    });
  });

  it('keeps a recoverable fallback when profile enrichment is incomplete', () => {
    expect(buildFoCustomerIdentityContract({ id: 'guest-1' })).toMatchObject({
      customerId: 'guest-1',
      storeScope: [],
      membershipStatus: 'unknown',
      profileStatus: 'needs-enrichment',
      cmsLookup: { route: '/users', search: 'guest-1' },
    });
  });
});

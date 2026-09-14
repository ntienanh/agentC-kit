export type FoCustomerIdentitySource = {
  id?: number | string | null;
  email?: string | null;
  phone?: string | null;
  displayName?: string | null;
  accessibleStoreIds?: readonly string[] | null;
  membershipStatus?: string | null;
  profileStatus?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type MvpCustomerIdentityContract = {
  customerId?: string;
  email?: string;
  phone?: string;
  displayName?: string;
  storeScope: string[];
  membershipStatus: string;
  profileStatus: 'complete' | 'needs-enrichment';
  createdAt?: string;
  updatedAt?: string;
  cmsLookup: {
    route: '/users';
    search?: string;
  };
};

function normalizeText(value?: string | null) {
  const normalized = value?.trim();
  return normalized || undefined;
}

export function buildFoCustomerIdentityContract(source: FoCustomerIdentitySource): MvpCustomerIdentityContract {
  const email = normalizeText(source.email)?.toLowerCase();
  const phone = normalizeText(source.phone);
  const displayName = normalizeText(source.displayName);
  const customerId = source.id == null ? undefined : String(source.id);
  const search = email || phone || customerId;

  return {
    customerId,
    email,
    phone,
    displayName,
    storeScope: [...(source.accessibleStoreIds ?? [])].filter(Boolean),
    membershipStatus: normalizeText(source.membershipStatus) ?? 'unknown',
    profileStatus: email && (phone || displayName) ? 'complete' : 'needs-enrichment',
    createdAt: normalizeText(source.createdAt),
    updatedAt: normalizeText(source.updatedAt),
    cmsLookup: {
      route: '/users',
      search,
    },
  };
}

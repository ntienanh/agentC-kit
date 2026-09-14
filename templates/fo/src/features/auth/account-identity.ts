import type { LoginResponse } from './api';

export type AccountIdentity = {
  customerId?: string;
  customerRefType: 'existing' | 'guest';
  email?: string;
  name?: string;
  phone?: string;
  storeId?: string;
};

export function resolveAccountIdentity(session: LoginResponse | null | undefined): AccountIdentity {
  const user = session?.user;
  return {
    customerId: user?.id ? String(user.id) : undefined,
    customerRefType: user?.id ? 'existing' : 'guest',
    email: user?.email || undefined,
    name: user?.email?.split('@')[0] || undefined,
    storeId: user?.accessibleStoreIds?.[0],
  };
}

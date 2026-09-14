import { afterEach, describe, expect, it, vi } from 'vitest';
import type { LoginResponse } from './api';
import { resolveAccountIdentity } from './account-identity';
import { clearAuthSession, getAuthSessionSnapshot, readAuthSession, saveAuthSession, subscribeAuthSession } from './session';

const session: LoginResponse = {
  jwt: 'jwt-token',
  refreshToken: 'refresh-token',
  user: {
    id: 42,
    email: 'customer@example.com',
    accessibleStoreIds: ['store-1'],
    emailVerified: true,
  },
};

describe('FO auth session continuity', () => {
  function installWindow(initialValue?: string) {
    const storage = new Map<string, string>();
    if (initialValue !== undefined) storage.set('fo-auth-session', initialValue);

    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();

    vi.stubGlobal('window', {
      addEventListener,
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
        removeItem: (key: string) => {
          storage.delete(key);
        },
        clear: () => {
          storage.clear();
        },
      },
      removeEventListener,
    });
  }

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('persists and clears the authenticated session for page reload continuity', () => {
    installWindow();
    saveAuthSession(session);

    expect(readAuthSession()).toEqual(session);

    clearAuthSession();
    expect(readAuthSession()).toBeNull();
  });

  it('notifies current-tab subscribers when the auth session changes', () => {
    installWindow();
    const listener = vi.fn();
    const unsubscribe = subscribeAuthSession(listener);

    saveAuthSession(session);
    clearAuthSession();

    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
  });

  it('returns a stable snapshot reference when storage has not changed', () => {
    installWindow(JSON.stringify(session));

    const firstSnapshot = getAuthSessionSnapshot();
    const secondSnapshot = getAuthSessionSnapshot();

    expect(secondSnapshot).toBe(firstSnapshot);
  });

  it('recovers safely when stored session data is corrupted', () => {
    installWindow('{bad json');

    expect(readAuthSession()).toBeNull();
  });

  it('resolves the same customer identity anchor used by account and dashboard journeys', () => {
    expect(resolveAccountIdentity(session)).toEqual({
      customerId: '42',
      customerRefType: 'existing',
      email: 'customer@example.com',
      name: 'customer',
      storeId: 'store-1',
    });
  });

  it('falls back to a guest identity when no session is available', () => {
    expect(resolveAccountIdentity(null)).toEqual({
      customerId: undefined,
      customerRefType: 'guest',
      email: undefined,
      name: undefined,
      storeId: undefined,
    });
  });
});

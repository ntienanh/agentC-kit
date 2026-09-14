'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import type { LoginResponse } from './api';
import { clearAuthSession, getAuthSessionSnapshot, saveAuthSession, subscribeAuthSession } from './session';

export function useFoSession() {
  const session = useSyncExternalStore(subscribeAuthSession, getAuthSessionSnapshot, () => null);
  const [hasHydratedSession, setHasHydratedSession] = useState(false);

  useEffect(() => {
    setHasHydratedSession(true);
  }, []);

  function setSession(nextSession: LoginResponse | null) {
    if (nextSession) {
      saveAuthSession(nextSession);
      return;
    }

    clearAuthSession();
  }

  return { session, hasHydratedSession, setSession };
}

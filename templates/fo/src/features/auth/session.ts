import type { LoginResponse } from './api';

const SESSION_KEY = 'fo-auth-session';
const sessionListeners = new Set<() => void>();
let cachedRawSession: string | null | undefined;
let cachedSession: LoginResponse | null = null;

function notifyAuthSessionChange() {
  sessionListeners.forEach((listener) => listener());
}

function parseAuthSession(raw: string | null): LoginResponse | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LoginResponse;
  } catch {
    return null;
  }
}

export function getAuthSessionSnapshot(): LoginResponse | null {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(SESSION_KEY);
  if (raw === cachedRawSession) return cachedSession;

  cachedRawSession = raw;
  cachedSession = parseAuthSession(raw);
  return cachedSession;
}

export function subscribeAuthSession(listener: () => void) {
  sessionListeners.add(listener);

  if (typeof window === 'undefined') {
    return () => {
      sessionListeners.delete(listener);
    };
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== SESSION_KEY) return;
    cachedRawSession = undefined;
    listener();
  };

  window.addEventListener('storage', handleStorage);

  return () => {
    sessionListeners.delete(listener);
    window.removeEventListener('storage', handleStorage);
  };
}

export function saveAuthSession(session: LoginResponse) {
  if (typeof window === 'undefined') return;
  const raw = JSON.stringify(session);
  window.localStorage.setItem(SESSION_KEY, raw);
  cachedRawSession = raw;
  cachedSession = session;
  notifyAuthSessionChange();
}

export function readAuthSession(): LoginResponse | null {
  return getAuthSessionSnapshot();
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SESSION_KEY);
  cachedRawSession = null;
  cachedSession = null;
  notifyAuthSessionChange();
}

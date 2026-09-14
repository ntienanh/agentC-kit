export const AUTH_EVENT_TYPES = {
  REFRESH_FAILED: 'auth_refresh_failed',
  FORCED_SIGNOUT: 'auth_forced_signout',
  PERMISSIONS_CHANGED: 'auth_permissions_changed',
} as const;

export const AUTH_SIGNOUT_REASONS = {
  REFRESH_FAILED: 'refresh_failed',
  SESSION_MISSING: 'session_missing',
  PROFILE_FETCH_FAILED: 'profile_fetch_failed',
  PERMISSIONS_CHANGED: 'permissions_changed',
  UNAUTHORIZED: 'unauthorized',
} as const;

type AuthEventType = (typeof AUTH_EVENT_TYPES)[keyof typeof AUTH_EVENT_TYPES];

type AuthEventPayload = {
  reason: string;
  errorCode?: string;
  status?: number;
  route?: string;
  context?: string;
};

export function logAuthEvent(type: AuthEventType, payload: AuthEventPayload): void {
  try {
    console.info(
      JSON.stringify({
        level: 'info',
        type,
        timestamp: new Date().toISOString(),
        ...payload,
      }),
    );
  } catch {
    void 0;
  }
}

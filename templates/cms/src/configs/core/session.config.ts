export const ACCESS_TOKEN = 'accessToken';
export const REFRESH_TOKEN = 'refreshToken';
export const ID_TOKEN = 'idToken';
export const ONE_TIME_TOKEN = 'ott';

export const SESSION_STORAGE_KEYS = {
  USER: 'user-storage',
  AUTH_REFRESH_DEBUG: 'debug:auth-refresh',
} as const;

export const SESSION_TIMING = {
  ONE_SECOND_MS: 1000,
  REFRESH_BUFFER_MS: 10_000,
  DEFAULT_EXPIRES_IN_SEC: 3600,
  MIN_EXPIRES_IN_SEC: 30,
  FALLBACK_ISSUED_AT_WINDOW_MS: 3_600_000,
  COUNTDOWN_WARNING_THRESHOLD_SEC: 15,
  COUNTDOWN_LOG_INTERVAL_SEC: 10,
} as const;

export const API_CONFIG = {
  QUERY: {
    STALE_TIME: 5 * 60 * 1000,
    GC_TIME: 10 * 60 * 1000,

    RETRY: 1,
    RETRY_DELAY: (attempt: number) => Math.min(1000 * 2 ** attempt, 30_000),

    REFRESH_ON_FOCUS: false,
    REFRESH_ON_RECONNECT: true,
    REFRESH_ON_MOUNT: false,

    NETWORK_MODE: 'online' as const,
  },

  MUTATION: {
    RETRY: 0,
    NETWORK_MODE: 'online' as const,
  },
} as const;

export const STALE_TIME = {
  SESSION: Infinity,
  SLOW: 5 * 60 * 1000,
  MEDIUM: 60 * 1000,
  FAST: 30 * 1000,
} as const;

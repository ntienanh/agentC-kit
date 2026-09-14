import { ENV_CLIENT } from './env/client.config';
import type { AppFeatureKey } from './features/feature-registry.config';
export type { AppFeatureKey };
import { DEFAULT_FEATURE_KEY, ENABLED_FEATURE_KEYS } from './features/feature-selection.config';
import { APP_HREFS } from './features/navigation.config';
import { DEFAULT_LOCALE } from './locale.config';

const ENABLE_FALLBACK_PERMISSIONS = process.env.NODE_ENV !== 'production';

export const APP_CONFIG = {
  identity: {
    name: ENV_CLIENT.APP_NAME,
  },
  routing: {
    defaultLocale: DEFAULT_LOCALE,
    defaultUnauthenticatedRoute: APP_HREFS.SIGNIN,
  },
  features: {
    enabled: ENABLED_FEATURE_KEYS,
    default: DEFAULT_FEATURE_KEY,
  },
  auth: {
    fallbackPermissions: ENABLE_FALLBACK_PERMISSIONS || [],
  },
} as const;

export function getEnabledFeatureKeys(): readonly AppFeatureKey[] {
  return APP_CONFIG.features.enabled;
}

export function isFeatureEnabled(key: AppFeatureKey): boolean {
  return APP_CONFIG.features.enabled.includes(key);
}

export function getDefaultAuthenticatedHref(): string {
  return APP_HREFS.DASHBOARD;
}

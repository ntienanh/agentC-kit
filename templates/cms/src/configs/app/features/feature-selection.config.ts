import type { AppFeatureKey } from './feature-registry.config';

export const ENABLED_FEATURE_KEYS = [
  'dashboard',
  'users',
  'roles',
  'permissions',
] as const satisfies readonly AppFeatureKey[];
export const DEFAULT_FEATURE_KEY = 'dashboard' as const satisfies AppFeatureKey;

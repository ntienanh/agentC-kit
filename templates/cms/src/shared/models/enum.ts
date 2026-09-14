export const APP_ROLE_NAMES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  USER: 'USER',
} as const;

export type AppRoleName = (typeof APP_ROLE_NAMES)[keyof typeof APP_ROLE_NAMES];
export type AssignableAppRoleName = Exclude<AppRoleName, typeof APP_ROLE_NAMES.SUPER_ADMIN>;

export const ENTITY_STATUSES = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
  DELETED: 'DELETED',
} as const;

export type EntityStatusValue = (typeof ENTITY_STATUSES)[keyof typeof ENTITY_STATUSES];

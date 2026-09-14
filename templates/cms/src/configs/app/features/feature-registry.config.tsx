import { PERMISSION_ACTIONS, PERMISSION_SUBJECTS } from '@/shared/rbac';
import {
  DashboardOutlined,
  KeyOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';
import { APP_HREFS } from './navigation.config';

export const APP_FEATURE_KEYS = ['dashboard', 'users', 'roles', 'permissions'] as const;

export type AppFeatureKey = (typeof APP_FEATURE_KEYS)[number];

export interface AppFeatureDefinition {
  key: AppFeatureKey;
  title: string;
  description?: string;
  route: {
    href: string;
    matchers: readonly string[];
  };
  navigation?: {
    label: string;
    icon?: ReactNode;
  };
  permissions?: {
    subject: string;
    actions: readonly string[];
  };
  namespaces?: readonly string[];
}

export const FEATURE_REGISTRY: Record<AppFeatureKey, AppFeatureDefinition> = {
  dashboard: {
    key: 'dashboard',
    title: 'Dashboard',
    route: {
      href: APP_HREFS.DASHBOARD,
      matchers: [APP_HREFS.DASHBOARD],
    },
    navigation: {
      label: 'Dashboard',
      icon: <DashboardOutlined />,
    },
  },
  users: {
    key: 'users',
    title: 'Users',
    route: {
      href: APP_HREFS.USERS,
      matchers: [APP_HREFS.USERS],
    },
    navigation: {
      label: 'Users',
      icon: <TeamOutlined />,
    },
    permissions: {
      subject: PERMISSION_SUBJECTS.USERS,
      actions: [PERMISSION_ACTIONS.READ],
    },
  },
  roles: {
    key: 'roles',
    title: 'Roles',
    route: {
      href: APP_HREFS.ROLES,
      matchers: [APP_HREFS.ROLES],
    },
    navigation: {
      label: 'Roles',
      icon: <SafetyCertificateOutlined />,
    },
    permissions: {
      subject: PERMISSION_SUBJECTS.ROLES,
      actions: [PERMISSION_ACTIONS.READ],
    },
  },
  permissions: {
    key: 'permissions',
    title: 'Permissions',
    route: {
      href: APP_HREFS.PERMISSIONS,
      matchers: [APP_HREFS.PERMISSIONS],
    },
    navigation: {
      label: 'Permissions',
      icon: <KeyOutlined />,
    },
    permissions: {
      subject: PERMISSION_SUBJECTS.PERMISSIONS,
      actions: [PERMISSION_ACTIONS.READ],
    },
  },
};

export function getFeatureByKey(key: AppFeatureKey): AppFeatureDefinition {
  return FEATURE_REGISTRY[key];
}

export function matchFeatureByPathname(pathname: string): AppFeatureDefinition | null {
  for (const key of APP_FEATURE_KEYS) {
    const feature = FEATURE_REGISTRY[key];
    const matches = feature.route.matchers.some((matcher) => pathname === matcher || pathname.startsWith(`${matcher}/`));

    if (matches) {
      return feature;
    }
  }

  return null;
}

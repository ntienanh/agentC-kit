import {
  DashboardOutlined,
  KeyOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { LogOut } from 'lucide-react';
import type { ReactNode } from 'react';
import { PERMISSION_ACTIONS, PERMISSION_SUBJECTS, permissionKey } from '@/shared/rbac';
import { APP_HREFS } from './navigation.config';

export interface SidebarItem {
  key: string;
  label: string;
  path?: string;
  href?: string;
  icon?: ReactNode;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
  excludeBaseRoles?: string[];
  requiredPermission?: string;
  featureKey?: string;
  children?: readonly SidebarItem[];
}

export const APP_SIDEBAR_ITEMS: SidebarItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: APP_HREFS.DASHBOARD,
    icon: <DashboardOutlined />,
    excludeBaseRoles: ['STAFF', 'USER'],
    featureKey: 'dashboard',
  },
  {
    key: 'users',
    label: 'Users',
    href: APP_HREFS.USERS,
    icon: <TeamOutlined />,
    excludeBaseRoles: ['STAFF', 'USER'],
    featureKey: 'users',
    requiredPermission: permissionKey(PERMISSION_SUBJECTS.USERS, PERMISSION_ACTIONS.READ),
  },
  {
    key: 'roles',
    label: 'Roles',
    href: APP_HREFS.ROLES,
    icon: <SafetyCertificateOutlined />,
    excludeBaseRoles: ['STAFF', 'USER'],
    featureKey: 'roles',
    requiredPermission: permissionKey(PERMISSION_SUBJECTS.ROLES, PERMISSION_ACTIONS.READ),
  },
  {
    key: 'permissions',
    label: 'Permissions',
    href: APP_HREFS.PERMISSIONS,
    icon: <KeyOutlined />,
    superAdminOnly: true,
    featureKey: 'permissions',
    requiredPermission: permissionKey(PERMISSION_SUBJECTS.PERMISSIONS, PERMISSION_ACTIONS.READ),
  },
];

export const APP_SIDEBAR_ACTIONS = {
  logout: {
    key: 'logout',
    icon: <LogOut size={16} />,
  },
} as const;

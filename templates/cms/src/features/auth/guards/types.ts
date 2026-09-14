import { PermissionAction, PermissionSubject } from '@/shared/rbac';
import { ReactNode } from 'react';

export interface GuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  loading?: ReactNode;
}

export interface PermissionGuardProps extends GuardProps {
  action: PermissionAction;
  subject: PermissionSubject;
  redirectTo?: string;
}

export interface ComponentGuardProps extends GuardProps {
  when: boolean;
}

export interface PageGuardProps extends PermissionGuardProps {
  requireAll?: boolean;
  permissions?: Array<{ action: PermissionAction; subject: PermissionSubject }>;
}

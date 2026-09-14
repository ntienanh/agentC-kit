'use client';

import { useCanAccessField } from '@/shared/hooks';
import { ReactNode } from 'react';

export interface FieldGuardProps {
  children: ReactNode;
  subject: string;
  field: string;
  action?: string;
  fallback?: ReactNode;
}

export function FieldGuard({ children, subject, field, action = 'read', fallback = null }: Readonly<FieldGuardProps>) {
  const canAccess = useCanAccessField({ subject, field, action });

  if (!canAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

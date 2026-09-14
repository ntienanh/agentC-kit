'use client';

import { APP_HREFS } from '@/configs/app/features/navigation.config';
import { useAbility } from '@/shared/rbac';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PermissionGuardProps } from './types';

export function PermissionGuard({
  children,
  action,
  subject,
  fallback = null,
  redirectTo = APP_HREFS.FORBIDDEN,
  loading = null,
}: Readonly<PermissionGuardProps>) {
  const ability = useAbility();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const checkPermission = () => {
      const canPerformAction = ability.can(action, subject);
      setHasPermission(canPerformAction);
      setIsChecking(false);

      if (!canPerformAction && redirectTo !== APP_HREFS.FORBIDDEN) {
        router.push(redirectTo);
      }
    };

    checkPermission();
  }, [ability, action, subject, redirectTo, router]);

  if (isChecking) {
    return <>{loading}</>;
  }

  if (!hasPermission) {
    if (redirectTo === APP_HREFS.FORBIDDEN) {
      return <>{fallback}</>;
    }
    return null;
  }

  return <>{children}</>;
}

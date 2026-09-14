'use client';

import { APP_HREFS } from '@/configs/app/features/navigation.config';
import { useAppRouter } from '@/shared/hooks';
import { useAbility } from '@/shared/rbac';
import { useEffect, useState } from 'react';
import { PageGuardProps } from './types';

export function PageGuard({
  children,
  action,
  subject,
  permissions,
  requireAll = false,
  loading = null,
}: Readonly<PageGuardProps>) {
  const ability = useAbility();
  const { replace } = useAppRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkPermissions = () => {
      let hasPermission = false;

      if (permissions && permissions.length > 0) {
        const results = permissions.map(({ action: permAction, subject: permSubject }) =>
          ability.can(permAction, permSubject),
        );

        hasPermission = requireAll
          ? results.every(Boolean)
          : results.some(Boolean);
      } else if (action && subject) {
        hasPermission = ability.can(action, subject);
      }

      setIsAuthorized(hasPermission);
      setIsChecking(false);

      if (!hasPermission) {
        replace(APP_HREFS.FORBIDDEN);
      }
    };

    checkPermissions();
  }, [ability, action, subject, permissions, requireAll, replace]);

  if (isChecking) {
    return <>{loading}</>;
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

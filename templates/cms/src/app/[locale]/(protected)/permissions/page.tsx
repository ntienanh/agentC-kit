'use client';

import { APP_HREFS } from '@/configs/app/features/navigation.config';
import { PermissionList } from '@/features/permissions';
import { useAppRouter } from '@/shared/hooks';
import { PERMISSION_ACTIONS, PERMISSION_SUBJECTS, permissionKey, usePermissions } from '@/shared/rbac';
import { useUserStore } from '@/shared/stores';
import { useEffect } from 'react';

export default function PermissionsRoute() {
  const { hasAllPermissions } = usePermissions();
  const { replace } = useAppRouter();
  const user = useUserStore(s => s.user);

  const canReadPermissions = hasAllPermissions([
    permissionKey(PERMISSION_SUBJECTS.PERMISSIONS, PERMISSION_ACTIONS.READ),
  ]);

  useEffect(() => {
    if (user !== null && !canReadPermissions) {
      replace(APP_HREFS.FORBIDDEN);
    }
  }, [user, canReadPermissions, replace]);

  if (user === null) return null;
  if (!canReadPermissions) return null;

  return <PermissionList />;
}

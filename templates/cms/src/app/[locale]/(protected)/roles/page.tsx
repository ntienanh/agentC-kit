'use client';

import { APP_HREFS } from '@/configs/app/features/navigation.config';
import { RoleList } from '@/features/roles';
import { useAppRouter } from '@/shared/hooks';
import { PERMISSION_ACTIONS, PERMISSION_SUBJECTS, permissionKey, usePermissions } from '@/shared/rbac';
import { AppBackdrop } from '@/shared/ui/loading/AppBackdrop';
import { useUserStore } from '@/shared/stores';
import { useEffect } from 'react';

export default function RolesRoute() {
  const { hasAllPermissions } = usePermissions();
  const { replace } = useAppRouter();
  const user = useUserStore(s => s.user);

  const canReadRoles = hasAllPermissions([permissionKey(PERMISSION_SUBJECTS.ROLES, PERMISSION_ACTIONS.READ)]);

  useEffect(() => {
    if (user !== null && !canReadRoles) {
      replace(APP_HREFS.FORBIDDEN);
    }
  }, [user, canReadRoles, replace]);

  if (user === null) return <AppBackdrop />;
  if (!canReadRoles) return <AppBackdrop />;

  return <RoleList />;
}

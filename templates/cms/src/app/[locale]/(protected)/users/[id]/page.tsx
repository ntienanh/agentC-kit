'use client';

import { APP_HREFS } from '@/configs/app/features/navigation.config';
import { UserDetailPage } from '@/features/users';
import { useAppRouter } from '@/shared/hooks';
import { PERMISSION_ACTIONS, PERMISSION_SUBJECTS, permissionKey, usePermissions } from '@/shared/rbac';
import { useUserStore } from '@/shared/stores';
import { use, useEffect } from 'react';

interface UserDetailRouteProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailRoute({ params }: UserDetailRouteProps) {
  const { id } = use(params);
  const { hasAllPermissions } = usePermissions();
  const { replace } = useAppRouter();
  const user = useUserStore(s => s.user);

  const canReadUsers = hasAllPermissions([permissionKey(PERMISSION_SUBJECTS.USERS, PERMISSION_ACTIONS.READ)]);

  useEffect(() => {
    if (user !== null && !canReadUsers) {
      replace(APP_HREFS.FORBIDDEN);
    }
  }, [user, canReadUsers, replace]);

  if (user === null) return null;
  if (!canReadUsers) return null;

  return <UserDetailPage id={id} />;
}

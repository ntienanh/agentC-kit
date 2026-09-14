'use client';

import { APP_HREFS } from '@/configs/app/features/navigation.config';
import { useAppRouter } from '@/shared/hooks/navigation/useAppRouter';
import { useEffect } from 'react';
import { useAbility } from '../ability';

export const useGuard = (action: string, subject: string) => {
  const ability = useAbility();
  const { replace } = useAppRouter();

  useEffect(() => {
    if (subject && !ability.can(action, subject)) {
      replace(APP_HREFS.FORBIDDEN);
    }
  }, [action, ability, replace, subject]);
};

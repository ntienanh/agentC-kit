'use client';

import { useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { authApi, normalizeAuthUser } from '@/features/auth';
import { useUserStore } from '@/shared/stores';
import { useAntdMessage, useAntdNotification } from '@/shared/hooks';
import { useI18n } from '@/shared/i18n';
import { APP_HREFS } from '@/configs/app/features/navigation.config';

export interface SignInCredentials {
  username: string;
  password: string;
  [key: string]: unknown;
}

export interface UseSignInLogicReturn {
  isPending: boolean;
  loading: boolean;
  permissionsChanged: boolean;
  onFinish: (values: SignInCredentials) => void;
}

export function useSignInLogic(): UseSignInLogicReturn {
  const searchParams = useSearchParams();
  const setUser = useUserStore(state => state.setUser);
  const t = useI18n('features.auth.signIn');
  const message = useAntdMessage();
  const notification = useAntdNotification();

  const permissionsChanged = searchParams.get('reason') === 'permissions_changed';

  const mutation = useMutation({
    mutationFn: async (values: SignInCredentials) => {
      const res = await authApi.login({ identifier: values.username, password: values.password });
      if (res.error || !res.data) {
        throw new Error(res.error?.message || t('loginFailed'));
      }
      return res.data;
    },
    onSuccess: (data) => {
      setUser(normalizeAuthUser(data.user));
      notification.success({
        title: t('loginSuccess'),
        description: 'Authentication successful. Redirecting to workspace...',
        placement: 'bottomRight',
        duration: 3.5,
      });
      window.location.href = APP_HREFS.DASHBOARD;
    },
    onError: (error: Error) => {
      message.error(error.message || t('loginFailed'));
    },
  });

  return {
    isPending: mutation.isPending,
    loading: mutation.isPending,
    permissionsChanged,
    onFinish: mutation.mutate,
  };
}

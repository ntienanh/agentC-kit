'use client';

import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/features/auth';
import { useAntdMessage } from '@/shared/hooks';
import { useI18n } from '@/shared/i18n';
import { useRouter } from '@/shared/i18n/navigation';
import { APP_HREFS } from '@/configs/app/features/navigation.config';
import { AUTH_UI } from '@/configs/app/auth/auth-flow.config';

export interface ResetPasswordValues {
  newPassword: string;
  [key: string]: unknown;
}

export function useResetPasswordLogic(token: string | null) {
  const t = useI18n('features.auth.resetPassword');
  const message = useAntdMessage();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (values: ResetPasswordValues) => {
      if (!token) {
        throw new Error(t('invalidToken'));
      }
      const res = await authApi.resetPassword({ token, newPassword: values.newPassword });
      if (res.error) {
        throw new Error(res.error.message || t('resetFailed'));
      }
      return res.data;
    },
    onSuccess: () => {
      message.success(t('successMessage'));
      setTimeout(() => {
        router.push(APP_HREFS.SIGNIN);
      }, AUTH_UI.SUCCESS_REDIRECT_DELAY_MS);
    },
    onError: (error: Error) => {
      message.error(error.message || t('resetFailed'));
    },
  });

  return {
    onFinish: mutation.mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
  };
}

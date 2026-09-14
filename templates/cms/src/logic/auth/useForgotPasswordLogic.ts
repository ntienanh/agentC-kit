'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/features/auth';
import { useAntdMessage } from '@/shared/hooks';
import { useI18n } from '@/shared/i18n';

export interface ForgotPasswordFormValues {
  email: string;
  [key: string]: unknown;
}

export function useForgotPasswordLogic() {
  const [successEmail, setSuccessEmail] = useState('');
  const t = useI18n('features.auth.forgotPassword');
  const message = useAntdMessage();

  const mutation = useMutation({
    mutationFn: async (values: ForgotPasswordFormValues) => {
      const res = await authApi.forgotPassword({ email: values.email.trim().toLowerCase() });
      if (res.error) {
        throw new Error(res.error.message || t('requestFailed'));
      }
      return { ...res.data, email: values.email };
    },
    onSuccess: (_, variables) => {
      setSuccessEmail(variables.email);
    },
    onError: (error: Error) => {
      message.error(error.message || t('requestFailed'));
    },
  });

  const onResend = () => {
    if (successEmail) {
      mutation.mutate({ email: successEmail });
    }
  };

  return {
    onFinish: mutation.mutate,
    onResend,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    successEmail,
  };
}

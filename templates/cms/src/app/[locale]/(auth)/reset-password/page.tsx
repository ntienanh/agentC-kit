'use client';

import { APP_HREFS } from '@/configs/app/features/navigation.config';
import { PasswordStrengthIndicator } from '@/features/auth';
import { useResetPasswordLogic } from '@/logic/auth/useResetPasswordLogic';
import { useAntdMessage } from '@/shared/hooks';
import { useI18n } from '@/shared/i18n';
import { Button, Form, Input } from 'antd';
import type { RuleObject } from 'antd/es/form';
import { LockIcon } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function ResetPasswordForm() {
  const t = useI18n('features.auth.resetPassword');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const message = useAntdMessage();
  const { onFinish, isPending, isSuccess } = useResetPasswordLogic(token);
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!token && !isSuccess) {
      message.error(t('invalidToken'));
    }
  }, [message, token, isSuccess, t]);

  const passwordValidationRules = [
    { required: true, message: t('passwordRequired') },
    {
      validator: async (_rule: RuleObject, value: string) => {
        if (!value) return;
        const isValid = value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value);
        if (!isValid) throw new Error(t('passwordWeak'));
      },
    },
  ];

  if (isSuccess) {
    return (
      <div className='flex flex-col items-center gap-4 text-center'>
        <div className='bg-primary/10 flex h-14 w-14 items-center justify-center rounded-full'>
          <LockIcon className='text-success h-6 w-6' />
        </div>
        <div>
          <h1 className='mb-2 text-xl font-semibold'>{t('title')}</h1>
          <p className='body-sm text-success'>{t('successMessage')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='mb-4! flex flex-col items-center gap-4 text-center'>
        <div className='bg-primary/10 flex h-14 w-14 items-center justify-center rounded-full'>
          <LockIcon className='text-primary h-6 w-6' />
        </div>
        <div>
          <h1 className='mb-2 text-xl font-semibold'>{t('title')}</h1>
          <p className='body-sm text-muted-foreground'>{t('subtitle')}</p>
        </div>
      </div>

      <Form name='resetPassword' onFinish={onFinish} layout='vertical' requiredMark={false}>
        <Form.Item name='newPassword' rules={passwordValidationRules} className='mb-4'>
          <Input.Password
            size='large'
            prefix={<LockIcon className='text-muted-foreground mr-1 h-4 w-4' />}
            placeholder={t('newPasswordPlaceholder')}
            className='rounded-lg text-sm'
            onChange={e => setPassword(e.target.value)}
          />
        </Form.Item>

        <PasswordStrengthIndicator password={password} />

        <Form.Item
          name='confirmPassword'
          dependencies={['newPassword']}
          rules={[
            { required: true, message: t('passwordRequired') },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(t('passwordsDoNotMatch')));
              },
            }),
          ]}
          className='mb-6'
        >
          <Input.Password
            size='large'
            prefix={<LockIcon className='text-muted-foreground mr-1 h-4 w-4' />}
            placeholder={t('confirmPasswordPlaceholder')}
            className='rounded-lg text-sm'
          />
        </Form.Item>

        <Button
          type='primary'
          htmlType='submit'
          block
          loading={isPending}
          size='large'
          className='mb-4 rounded-lg! text-sm! font-semibold!'
        >
          {t('submitButton')}
        </Button>

        <div className='flex justify-center'>
          <Link
            href={APP_HREFS.SIGNIN}
            className='body-sm text-primary hover:text-primary/80 font-medium transition-colors'
          >
            {t('backToLogin')}
          </Link>
        </div>
      </Form>
    </>
  );
}

export default function ResetPasswordPage() {
  const tCommon = useI18n('common');
  return (
    <section className='px-8!'>
      <Suspense fallback={<div>{tCommon('loading')}</div>}>
        <ResetPasswordForm />
      </Suspense>
    </section>
  );
}

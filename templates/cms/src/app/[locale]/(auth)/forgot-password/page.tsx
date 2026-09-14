'use client';

import { APP_HREFS } from '@/configs/app/features/navigation.config';
import { useForgotPasswordLogic } from '@/logic/auth/useForgotPasswordLogic';
import { useI18n } from '@/shared/i18n';
import { Button, Form, Input, Result } from 'antd';
import { MailIcon } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const { onFinish, onResend, isPending, isSuccess, successEmail } = useForgotPasswordLogic();
  const t = useI18n('features.auth.forgotPassword');

  if (isSuccess) {
    return (
      <section className='px-8!'>
        <Result
          status='success'
          title={<div className='text-xl font-semibold'>{t('title')}</div>}
          subTitle={
            <div className='text-muted-foreground'>
              {t('successMessage')} <br />
              <strong className='text-foreground'>{successEmail}</strong>
            </div>
          }
          extra={[
            <Button
              key='resend'
              type='default'
              loading={isPending}
              onClick={onResend}
              size='large'
              className='mb-4 w-full rounded-lg! text-sm! font-semibold!'
            >
              Resend Email
            </Button>,
            <Link key='login' href={APP_HREFS.SIGNIN} className='w-full'>
              <Button type='primary' size='large' className='w-full rounded-lg! text-sm! font-semibold!'>
                {t('backToLogin')}
              </Button>
            </Link>,
          ]}
          className='p-0!'
        />
      </section>
    );
  }

  return (
    <section className='px-8!'>
      <div className='mb-4! flex flex-col items-center gap-4 text-center'>
        <div className='bg-primary/10 flex h-14 w-14 items-center justify-center rounded-full'>
          <MailIcon className='text-primary h-6 w-6' />
        </div>

        <div>
          <h1 className='mb-2 text-xl font-semibold'>{t('title')}</h1>
          <p className='body-sm text-muted-foreground'>{t('subtitle')}</p>
        </div>
      </div>

      <Form name='forgotPassword' onFinish={onFinish} layout='vertical' requiredMark={false}>
        <Form.Item
          name='email'
          rules={[
            { required: true, message: t('emailRequired') },
            { type: 'email', message: t('emailInvalid') },
          ]}
          className='mb-6'
        >
          <Input
            size='large'
            prefix={<MailIcon className='text-muted-foreground mr-1 h-4 w-4' />}
            placeholder={t('emailPlaceholder')}
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
    </section>
  );
}

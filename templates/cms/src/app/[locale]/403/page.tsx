'use client';

import { APP_HREFS } from '@/configs/app/features/navigation.config';
import { useI18n } from '@/shared/i18n';
import { useRouter } from '@/shared/i18n/navigation';
import { Alert, Button, Result } from 'antd';

export default function ForbiddenPage() {
  const router = useRouter();
  const t = useI18n('pages.forbidden');

  return (
    <div className='bg-background flex min-h-screen items-center justify-center px-4'>
      <Result
        status='403'
        title='403'
        subTitle={t('subtitle')}
        extra={
          <div className='mx-auto flex max-w-xl flex-col gap-4'>
            <Alert
              type='warning'
              showIcon
              message='Access continuity'
              description='403 should route operators back to Dashboard or prior workspace, then Roles / Permissions / Users can verify the missing access path.'
            />
            <div className='flex items-center justify-center gap-3'>
              <Button onClick={() => router.back()}>{t('goBack')}</Button>
              <Button type='primary' onClick={() => router.push(APP_HREFS.DASHBOARD)}>
                {t('goToDashboard')}
              </Button>
            </div>
          </div>
        }
      />
    </div>
  );
}

'use client';

import { useI18n } from '@/shared/i18n';
import { Button, Modal, Typography } from 'antd';
import { useEffect, useState } from 'react';

interface PermissionsChangedModalProps {
  open: boolean;
  onSignIn: () => void;
}

const COUNTDOWN_SECONDS = 10;

export function PermissionsChangedModal({ open, onSignIn }: Readonly<PermissionsChangedModalProps>) {
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const tCommon = useI18n('common');

  useEffect(() => {
    if (!open) {
      return;
    }

    const resetTimer = setTimeout(() => setCountdown(COUNTDOWN_SECONDS), 0);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onSignIn();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(resetTimer);
      clearInterval(interval);
    };
  }, [open, onSignIn]);

  return (
    <Modal open={open} closable={false} mask={{ closable: false }} keyboard={false} footer={null} centered width={420}>
      <div className='flex flex-col items-center gap-4 py-4 text-center'>
        <div className='bg-warning-bg flex h-14 w-14 items-center justify-center rounded-full text-3xl'>🔐</div>

        <div className='flex flex-col gap-1'>
          <Typography.Title level={4} className='mb-0!'>
            {tCommon('permissionsChangedTitle')}
          </Typography.Title>
          <Typography.Text type='secondary'>{tCommon('permissionsChangedDescription')}</Typography.Text>
        </div>

        <Typography.Text className='text-warning font-medium'>
          {tCommon('permissionsChangedCountdown', { countdown })}
        </Typography.Text>

        <Button type='primary' size='large' onClick={onSignIn} className='w-full'>
          {tCommon('signInAgainNow')}
        </Button>
      </div>
    </Modal>
  );
}

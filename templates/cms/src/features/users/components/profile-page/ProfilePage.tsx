'use client';

import { APP_HREFS } from '@/configs/app/features/navigation.config';
import { useAntdMessage, useAppRouter } from '@/shared/hooks';
import { useI18n } from '@/shared/i18n';
import { showErrorMessage } from '@/shared/lib/error';
import { AppButton } from '@/shared/ui/button/AppButton';
import { AppCard } from '@/shared/ui/card/AppCard';
import { AppPageHeader } from '@/shared/ui/page/AppPageHeader';
import { AppStatusTag } from '@/shared/ui/status/AppStatusTag';
import dayjs from '@/shared/utils/dayjs.util';
import { Alert, Descriptions, Skeleton } from 'antd';
import { KeyRound, Shield } from 'lucide-react';
import { useSelfProfileMutation } from '@/logic/users/useSelfProfileMutation';
import { useSelfProfileQuery } from '@/logic/users/useSelfProfileQuery';
import type { UpdateSelfProfileRequest } from '../../services/user-management.types';
import { ProfileEditForm } from './ProfileEditForm';

const ACCOUNT_DELETED_MESSAGE = 'Account has been disabled';

export function ProfilePage() {
  const { profile, isLoading } = useSelfProfileQuery();
  const { updateProfile } = useSelfProfileMutation();
  const { push } = useAppRouter();
  const message = useAntdMessage();
  const tError = useI18n('error');
  const t = useI18n('features.userManagement');

  const handleSubmit = async (data: UpdateSelfProfileRequest) => {
    try {
      await updateProfile.mutateAsync(data);
      message.success(t('profilePage.updateSuccess'));
    } catch (err) {
      showErrorMessage(message, err, tError, 'PROFILE_UPDATE_FAILED');
    }
  };

  const isAccountDeleted = updateProfile.error?.message === ACCOUNT_DELETED_MESSAGE;

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 6 }} />;
  }

  if (!profile) {
    return <Alert type='error' title={tError('PROFILE_LOAD_FAILED')} showIcon />;
  }

  return (
    <div className='content-spacing space-y-6'>
      <AppPageHeader
        title={t('profilePage.accountInfoTitle')}
        description='Manage your personal administrator identity, contact information, and active security parameters.'
        actions={
          <AppButton icon={<KeyRound size={15} />} onClick={() => push(APP_HREFS.PROFILE_SESSIONS)}>
            {t('profilePage.manageSessions')}
          </AppButton>
        }
      />

      {isAccountDeleted && (
        <Alert
          type='error'
          title={t('profilePage.accountDisabledTitle')}
          description={t('profilePage.accountDisabledDescription')}
          showIcon
        />
      )}

      <AppCard
        title={
          <div className='flex items-center gap-2'>
            <Shield size={16} className='text-primary' />
            <span className='text-foreground text-sm font-semibold'>{t('profilePage.accountInfoTitle')}</span>
          </div>
        }
      >
        <Descriptions column={{ xs: 1, sm: 2 }} size='small'>
          <Descriptions.Item label={t('profilePage.emailLabel')}>{profile.email}</Descriptions.Item>
          <Descriptions.Item label={t('profilePage.roleLabel')}>
            <AppStatusTag tone='primary'>{profile.role?.name ?? '—'}</AppStatusTag>
          </Descriptions.Item>
          <Descriptions.Item label={t('profilePage.emailVerifiedLabel')}>
            <AppStatusTag tone={profile.emailVerified ? 'success' : 'warning'}>
              {profile.emailVerified ? t('profilePage.verified') : t('profilePage.unverified')}
            </AppStatusTag>
          </Descriptions.Item>
          <Descriptions.Item label={t('profilePage.createdAtLabel')}>
            {dayjs(profile.createdAt).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
        </Descriptions>
      </AppCard>

      <AppCard
        title={<span className='text-foreground text-sm font-semibold'>{t('profilePage.editProfileTitle')}</span>}
      >
        <ProfileEditForm profile={profile} onSubmit={handleSubmit} loading={updateProfile.isPending} />
      </AppCard>
    </div>
  );
}

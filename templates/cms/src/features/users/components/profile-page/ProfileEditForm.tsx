'use client';

import { useI18n } from '@/shared/i18n';
import { Button, Form, Input } from 'antd';
import { useEffect } from 'react';
import type { PublicProfile } from '../../models';
import type { UpdateSelfProfileRequest } from '../../services/user-management.types';

interface ProfileEditFormProps {
  profile: PublicProfile;
  onSubmit: (data: UpdateSelfProfileRequest) => void;
  loading: boolean;
}

export function ProfileEditForm({ profile, onSubmit, loading }: Readonly<ProfileEditFormProps>) {
  const t = useI18n('features.userManagement');
  const [form] = Form.useForm<UpdateSelfProfileRequest>();

  useEffect(() => {
    form.setFieldsValue({
      displayName: profile.displayName ?? undefined,
      phone: profile.phone ?? undefined,
      avatar: profile.avatar ?? undefined,
    });
  }, [form, profile]);

  return (
    <Form form={form} layout='vertical' onFinish={onSubmit} className='max-w-lg'>
      <Form.Item
        label={t('profile.displayNameLabel')}
        name='displayName'
        rules={[{ max: 100, message: t('profile.displayNameMax') }]}
      >
        <Input placeholder={t('profile.displayNamePlaceholder')} />
      </Form.Item>

      <Form.Item label={t('profile.phoneLabel')} name='phone'>
        <Input placeholder={t('profile.phonePlaceholder')} />
      </Form.Item>

      <Form.Item label={t('profile.avatarLabel')} name='avatar'>
        <Input placeholder={t('profile.avatarPlaceholder')} />
      </Form.Item>

      <Form.Item>
        <Button type='primary' htmlType='submit' loading={loading} disabled={loading}>
          {t('profile.saveChanges')}
        </Button>
      </Form.Item>
    </Form>
  );
}

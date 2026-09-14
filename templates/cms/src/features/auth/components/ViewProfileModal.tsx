'use client';

import { useI18n } from '@/shared/i18n';
import { AppModal } from '@/shared/ui/modal/AppModal';
import dayjs from '@/shared/utils/dayjs.util';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  MailOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Descriptions, Form, Input, Tag } from 'antd';
import { useState } from 'react';
import { authApi } from '../services/auth.api';
import { useAuthStore } from '../stores';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface EditProfileValues {
  displayName: string;
}

const PROFILE_DISPLAY_NAME_MIN_LENGTH = 2;
const PROFILE_DISPLAY_NAME_MAX_LENGTH = 50;

export function ViewProfileModal({ open, onClose }: Readonly<Props>) {
  const [form] = Form.useForm<EditProfileValues>();
  const [editing, setEditing] = useState(false);
  const [isPending, setLoading] = useState(false);
  const user = useAuthStore(s => s.user);
  const t = useI18n('features.auth.profile');

  const handleCancel = () => {
    setEditing(false);
    form.resetFields();
  };

  const handleSave = async (values: EditProfileValues) => {
    setLoading(true);
    try {
      await authApi.updateProfile(values);
      setEditing(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppModal title={t('modalTitle')} open={open} onClose={onClose} showFooter={false}>
      <div className='mb-4 flex items-center gap-3'>
        <div>
          <h3 className='text-lg font-semibold'>{user?.displayName || '—'}</h3>
          {user?.role && (
            <Tag color='blue' className='mt-1'>
              {String(user.role)}
            </Tag>
          )}
        </div>
      </div>

      <Descriptions column={1} bordered size='small' className='mt-2' labelStyle={{ width: '10rem', fontWeight: 500 }}>
        <Descriptions.Item
          label={
            <span className='flex items-center gap-2'>
              <UserOutlined /> {t('displayName')}
            </span>
          }
        >
          {editing ? (
            <Form form={form} initialValues={{ displayName: user?.displayName || '' }} onFinish={handleSave}>
              <div className='flex items-center gap-2'>
                <Form.Item
                  name='displayName'
                  noStyle
                  rules={[
                    { required: true, message: t('displayNameRequired') },
                    {
                      min: PROFILE_DISPLAY_NAME_MIN_LENGTH,
                      message: t('displayNameMin', { min: PROFILE_DISPLAY_NAME_MIN_LENGTH }),
                    },
                    {
                      max: PROFILE_DISPLAY_NAME_MAX_LENGTH,
                      message: t('displayNameMax', { max: PROFILE_DISPLAY_NAME_MAX_LENGTH }),
                    },
                  ]}
                >
                  <Input size='small' placeholder={t('displayNamePlaceholder')} autoFocus />
                </Form.Item>
                <Button type='primary' size='small' htmlType='submit' loading={isPending}>
                  {t('save')}
                </Button>
                <Button size='small' onClick={handleCancel} disabled={isPending}>
                  {t('cancel')}
                </Button>
              </div>
            </Form>
          ) : (
            <div className='flex items-center justify-between'>
              <span>{user?.displayName || '—'}</span>
              <Button type='text' size='small' icon={<EditOutlined />} onClick={() => setEditing(true)} />
            </div>
          )}
        </Descriptions.Item>

        <Descriptions.Item
          label={
            <span className='flex items-center gap-2'>
              <MailOutlined /> {t('email')}
            </span>
          }
        >
          {user?.email || '—'}
        </Descriptions.Item>

        <Descriptions.Item label={t('verificationStatus')}>
          {user?.emailVerified ? (
            <Tag icon={<CheckCircleOutlined />} color='success'>
              Verified
            </Tag>
          ) : (
            <Tag icon={<CloseCircleOutlined />} color='default'>
              Unverified
            </Tag>
          )}
        </Descriptions.Item>

        <Descriptions.Item label={t('accountStatus')}>
          {user?.status === 'ACTIVE' ? <Tag color='success'>{t('active')}</Tag> : <Tag color='error'>{t('blocked')}</Tag>}
        </Descriptions.Item>

        {user?.role && (
          <Descriptions.Item label={t('roles')}>
            <Tag color='blue'>{String(user.role)}</Tag>
          </Descriptions.Item>
        )}

        {user?.createdAt && (
          <Descriptions.Item
            label={
              <span className='flex items-center gap-2'>
                <CalendarOutlined /> {t('createdAt')}
              </span>
            }
          >
            {dayjs(user.createdAt).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
        )}

        {user?.updatedAt && (
          <Descriptions.Item
            label={
              <span className='flex items-center gap-2'>
                <CalendarOutlined /> Last updated
              </span>
            }
          >
            {dayjs(user.updatedAt).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
        )}
      </Descriptions>
    </AppModal>
  );
}

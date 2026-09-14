'use client';

import { useAntdMessage } from '@/shared/hooks';
import { useI18n } from '@/shared/i18n';
import { showErrorMessage } from '@/shared/lib/error';
import { AppModal } from '@/shared/ui/modal/AppModal';
import { Form, Input } from 'antd';
import { useState } from 'react';
import { authApi } from '../services/auth.api';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface FormValues {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const CHANGE_PASSWORD_MIN_LENGTH = 6;

export function ChangePasswordModal({ open, onClose }: Readonly<Props>) {
  const message = useAntdMessage();
  const t = useI18n('features.auth.changePassword');
  const tError = useI18n('error');
  const [form] = Form.useForm<FormValues>();
  const [isPending, setLoading] = useState(false);

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await authApi.changePassword(values);
      message.success(t('success'));
      form.resetFields();
      onClose();
    } catch (err: unknown) {
      showErrorMessage(message, err, tError, 'AUTH_CHANGE_PASSWORD_FAILED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppModal
      title={t('title')}
      open={open}
      onClose={() => {
        form.resetFields();
        onClose();
      }}
      onOk={() => form.submit()}
      okText={t('confirm')}
      cancelText={t('cancel')}
      confirmLoading={isPending}
      showFooter
    >
      <Form form={form} layout='vertical' onFinish={handleSubmit} className='mt-4'>
        <Form.Item
          name='currentPassword'
          label={t('currentPasswordLabel')}
          rules={[{ required: true, message: t('currentPasswordRequired') }]}
        >
          <Input.Password placeholder={t('currentPasswordPlaceholder')} />
        </Form.Item>

        <Form.Item
          name='newPassword'
          label={t('newPasswordLabel')}
          rules={[
            { required: true, message: t('newPasswordRequired') },
            {
              min: CHANGE_PASSWORD_MIN_LENGTH,
              message: t('newPasswordMin', { min: CHANGE_PASSWORD_MIN_LENGTH }),
            },
          ]}
        >
          <Input.Password placeholder={t('newPasswordPlaceholder')} />
        </Form.Item>

        <Form.Item
          name='confirmNewPassword'
          label={t('confirmPasswordLabel')}
          dependencies={['newPassword']}
          rules={[
            { required: true, message: t('confirmPasswordRequired') },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                return Promise.reject(new Error(t('confirmPasswordMismatch')));
              },
            }),
          ]}
        >
          <Input.Password placeholder={t('confirmPasswordPlaceholder')} />
        </Form.Item>
      </Form>
    </AppModal>
  );
}

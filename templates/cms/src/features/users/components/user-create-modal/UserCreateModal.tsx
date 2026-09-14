'use client';

import { useAntdMessage } from '@/shared/hooks';
import { useI18n } from '@/shared/i18n';
import { showErrorMessage } from '@/shared/lib/error';
import { AppModal } from '@/shared/ui/modal/AppModal';
import { Form, Input, Select } from 'antd';
import { useEffect } from 'react';
import { UserRole } from '@repo/contracts';
import { useUserMutation } from '@/logic/users/useUserMutation';
import type { CreateUserRequest } from '../../services/user-management.types';

interface UserCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const USER_CREATE_MODAL_WIDTH = 500;
const USER_PASSWORD_MIN_LENGTH = 8;

const ROLE_OPTIONS = [
  { label: 'Super Admin', value: UserRole.SUPER_ADMIN },
  { label: 'Admin', value: UserRole.ADMIN },
  { label: 'Staff', value: UserRole.STAFF },
  { label: 'User', value: UserRole.USER },
];

export function UserCreateModal({ open, onClose, onSuccess }: Readonly<UserCreateModalProps>) {
  const message = useAntdMessage();
  const tError = useI18n('error');
  const [form] = Form.useForm<CreateUserRequest & { role?: UserRole }>();
  const { createUser } = useUserMutation();

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldValue('role', UserRole.USER);
    }
  }, [open, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();

    try {
      await createUser.mutateAsync(values);
      message.success('User created successfully');
      form.resetFields();
      onClose();
      onSuccess?.();
    } catch (error) {
      showErrorMessage(message, error, tError, 'USER_CREATE_FAILED');
    }
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      onOk={handleSubmit}
      confirmLoading={createUser.isPending}
      title='Create new user'
      okText='Create'
      cancelText='Cancel'
      width={USER_CREATE_MODAL_WIDTH}
      showFooter
    >
      <Form form={form} layout='vertical' className='mt-4'>
        <Form.Item
          name='email'
          label='Email'
          rules={[
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Email is invalid' },
          ]}
        >
          <Input placeholder='user@example.com' />
        </Form.Item>

        <Form.Item
          name='password'
          label='Password'
          rules={[
            { required: true, message: 'Password is required' },
            {
              min: USER_PASSWORD_MIN_LENGTH,
              message: `Password must be at least ${USER_PASSWORD_MIN_LENGTH} characters`,
            },
          ]}
        >
          <Input.Password placeholder='Enter password' />
        </Form.Item>

        <Form.Item
          name='displayName'
          label='Display name'
          rules={[{ required: true, message: 'Display name is required' }]}
        >
          <Input placeholder='User name' />
        </Form.Item>

        <Form.Item name='role' label='System role'>
          <Select options={ROLE_OPTIONS} />
        </Form.Item>
      </Form>
    </AppModal>
  );
}

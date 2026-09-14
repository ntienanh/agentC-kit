'use client';

import { Button, Form, Input } from 'antd';
import { useEffect } from 'react';
import type { PublicProfile } from '../../models';
import type { UpdateUserByAdminRequest } from '../../services/user-management.types';

interface UserEditFormProps {
  user: PublicProfile;
  onSubmit: (data: UpdateUserByAdminRequest) => void;
  loading: boolean;
}

export function UserEditForm({ user, onSubmit, loading }: UserEditFormProps) {
  const [form] = Form.useForm<UpdateUserByAdminRequest>();

  useEffect(() => {
    form.setFieldsValue({
      displayName: user.displayName ?? undefined,
      phone: user.phone ?? undefined,
      avatar: user.avatar ?? undefined,
    });
  }, [form, user]);

  return (
    <Form form={form} layout='vertical' onFinish={onSubmit} className='max-w-lg'>
      <Form.Item
        label='Display name'
        name='displayName'
        rules={[{ max: 100, message: 'Display name cannot exceed 100 characters' }]}
      >
        <Input placeholder='Enter display name' />
      </Form.Item>

      <Form.Item label='Phone number' name='phone'>
        <Input placeholder='Enter phone number' />
      </Form.Item>

      <Form.Item label='Avatar URL' name='avatar'>
        <Input placeholder='Enter avatar URL' />
      </Form.Item>

      <Form.Item>
        <Button type='primary' htmlType='submit' loading={loading} disabled={loading}>
          Save changes
        </Button>
      </Form.Item>
    </Form>
  );
}

'use client';

import { AppModal } from '@/shared/ui/modal/AppModal';
import { AppSkeleton } from '@/shared/ui/loading/AppSkeleton';
import { Form, Input, Select } from 'antd';
import { useEffect } from 'react';
import { UserRole } from '@repo/contracts';
import type { PublicProfile } from '../../models';
import type { UpdateUserByAdminRequest } from '../../services/user-management.types';

interface UserEditModalProps {
  open: boolean;
  user: PublicProfile;
  isSelf: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateUserByAdminRequest & { roleId?: string }) => void;
}

const DISPLAY_NAME_MAX_LENGTH = 100;
const USER_EDIT_MODAL_WIDTH = 480;

const ROLE_OPTIONS = [
  { label: 'Super Admin', value: UserRole.SUPER_ADMIN },
  { label: 'Admin', value: UserRole.ADMIN },
  { label: 'Staff', value: UserRole.STAFF },
  { label: 'User', value: UserRole.USER },
];

export function UserEditModal({ open, user, isSelf, loading, onClose, onSubmit }: UserEditModalProps) {
  const [form] = Form.useForm<{ displayName?: string; phone?: string; avatar?: string; roleId?: string }>();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        displayName: user.displayName ?? undefined,
        phone: user.phone ?? undefined,
        avatar: user.avatar ?? undefined,
        roleId: user.role?.id ? String(user.role.id) : undefined,
      });
    }
  }, [open, user, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    onSubmit({
      displayName: values.displayName,
      phone: values.phone,
      avatar: values.avatar,
      roleId: values.roleId,
    });
  };

  return (
    <AppModal
      open={open}
      title='Edit user'
      okText='Save changes'
      cancelText='Cancel'
      confirmLoading={loading}
      onOk={handleOk}
      onClose={onClose}
      width={USER_EDIT_MODAL_WIDTH}
      showFooter={!loading}
    >
      {loading ? (
        <AppSkeleton.Modal rows={2} />
      ) : (
        <Form form={form} layout='vertical' className='mt-4'>
          <Form.Item
            label='Display name'
            name='displayName'
            rules={[{ max: DISPLAY_NAME_MAX_LENGTH, message: `Maximum ${DISPLAY_NAME_MAX_LENGTH} characters` }]}
          >
            <Input placeholder='Enter display name' />
          </Form.Item>

          <Form.Item label='Phone number' name='phone'>
            <Input placeholder='Enter phone number' />
          </Form.Item>

          <Form.Item label='Avatar URL' name='avatar'>
            <Input placeholder='Enter avatar URL' />
          </Form.Item>

          {!isSelf && (
            <Form.Item label='System role' name='roleId'>
              <Select options={ROLE_OPTIONS} placeholder='Select role' />
            </Form.Item>
          )}
        </Form>
      )}
    </AppModal>
  );
}

'use client';

import { useI18n } from '@/shared/i18n';
import { AppButton } from '@/shared/ui/button/AppButton';
import { Form, Input } from 'antd';

interface RoleFormValues {
  name: string;
  description?: string;
}

interface RoleFormProps {
  initialValues?: RoleFormValues;
  onSubmit: (values: RoleFormValues) => void;
  loading?: boolean;
}

const NAME_PATTERN = /^[a-zA-Z0-9 _-]+$/;
const ROLE_NAME_MIN_LENGTH = 3;
const ROLE_NAME_MAX_LENGTH = 50;
const ROLE_DESCRIPTION_MAX_LENGTH = 500;
const ROLE_DESCRIPTION_ROWS = 3;

export function RoleForm({ initialValues, onSubmit, loading }: Readonly<RoleFormProps>) {
  const [form] = Form.useForm<RoleFormValues>();
  const t = useI18n('features.roles');

  return (
    <Form form={form} layout='vertical' initialValues={initialValues} onFinish={onSubmit} autoComplete='off'>
      <Form.Item
        label={t('form.roleName')}
        name='name'
        rules={[
          { required: true, message: t('form.roleNameRequired') },
          { min: ROLE_NAME_MIN_LENGTH, message: t('form.roleNameMin', { min: ROLE_NAME_MIN_LENGTH }) },
          { max: ROLE_NAME_MAX_LENGTH, message: t('form.roleNameMax', { max: ROLE_NAME_MAX_LENGTH }) },
          {
            pattern: NAME_PATTERN,
            message: t('form.roleNamePattern'),
          },
        ]}
      >
        <Input placeholder={t('form.roleNamePlaceholder')} spellCheck={false} />
      </Form.Item>

      <Form.Item
        label={t('form.description')}
        name='description'
        rules={[
          {
            max: ROLE_DESCRIPTION_MAX_LENGTH,
            message: t('form.descriptionMax', { max: ROLE_DESCRIPTION_MAX_LENGTH }),
          },
        ]}
      >
        <Input.TextArea rows={ROLE_DESCRIPTION_ROWS} placeholder={t('form.descriptionPlaceholder')} />
      </Form.Item>

      <Form.Item>
        <AppButton type='primary' htmlType='submit' loading={loading}>
          {t('form.saveRole')}
        </AppButton>
      </Form.Item>
    </Form>
  );
}

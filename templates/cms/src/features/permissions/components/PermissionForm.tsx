'use client';

import { Button, Form, Input, Select, Typography } from 'antd';
import { usePermissionActions } from '@/logic/permissions/usePermissionActions';
import type { PermissionsGrouped } from '../types';

interface PermissionFormValues {
  name?: string;
  resource?: string;
  action?: string;
  description?: string;
}

interface PermissionFormProps {
  initialValues?: PermissionFormValues;
  onSubmit: (values: PermissionFormValues) => void;
  loading?: boolean;
  isEdit?: boolean;
  existingPermissions?: PermissionsGrouped;
}

const COMMON_RESOURCES = ['users', 'roles', 'permissions', 'media', 'messages'];
const PERMISSION_DESCRIPTION_MAX_LENGTH = 500;
const PERMISSION_DESCRIPTION_ROWS = 3;

function parseNameToResourceAction(name?: string) {
  if (!name) return { resource: undefined, action: undefined };
  const [resource, action] = name.split(':');
  return { resource, action };
}

export function PermissionForm({
  initialValues,
  onSubmit,
  loading,
  isEdit,
  existingPermissions = {},
}: PermissionFormProps) {
  const [form] = Form.useForm<PermissionFormValues>();
  const { actions: allActions } = usePermissionActions();

  const selectedResource = Form.useWatch('resource', form) as string | undefined;
  const selectedAction = Form.useWatch('action', form) as string | undefined;

  const parsed = parseNameToResourceAction(initialValues?.name);
  const defaultValues = isEdit ? { ...initialValues, resource: parsed.resource, action: parsed.action } : initialValues;

  const handleFinish = (values: PermissionFormValues) => {
    if (!isEdit) {
      onSubmit({ ...values, name: `${values.resource}:${values.action}` });
    } else {
      onSubmit(values);
    }
  };

  const existingActions = selectedResource ? (existingPermissions[selectedResource] ?? []).map(p => p.action) : [];

  const actionOptions = allActions.map(a => ({
    label: a,
    value: a,
    disabled: existingActions.includes(a),
  }));

  const preview = selectedResource && selectedAction ? `${selectedResource}:${selectedAction}` : '—';

  return (
    <Form form={form} layout='vertical' initialValues={defaultValues} onFinish={handleFinish} autoComplete='off'>
      {isEdit ? (
        <Form.Item label='Permission name'>
          <Typography.Text code>{initialValues?.name}</Typography.Text>
        </Form.Item>
      ) : (
        <>
          <Form.Item
            label='Resource'
            name='resource'
            rules={[{ required: true, message: 'Please select a resource.' }]}
          >
            <Select
              placeholder='Select or enter a resource'
              options={COMMON_RESOURCES.map(r => ({ label: r, value: r }))}
              showSearch
              allowClear
              onChange={() => form.setFieldValue('action', undefined)}
            />
          </Form.Item>

          <Form.Item label='Action' name='action' rules={[{ required: true, message: 'Please select an action.' }]}>
            <Select placeholder='Select an action' options={actionOptions} showSearch allowClear />
          </Form.Item>

          <Form.Item label='Permission name (preview)'>
            <Typography.Text code>{preview}</Typography.Text>
          </Form.Item>
        </>
      )}

      <Form.Item
        label='Description'
        name='description'
        rules={[
          {
            max: PERMISSION_DESCRIPTION_MAX_LENGTH,
            message: `Description cannot exceed ${PERMISSION_DESCRIPTION_MAX_LENGTH} characters.`,
          },
        ]}
      >
        <Input.TextArea rows={PERMISSION_DESCRIPTION_ROWS} placeholder='Permission description (optional)' />
      </Form.Item>

      <Form.Item>
        <Button type='primary' htmlType='submit' loading={loading}>
          Save
        </Button>
      </Form.Item>
    </Form>
  );
}

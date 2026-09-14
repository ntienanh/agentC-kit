'use client';

import { useAntdMessage } from '@/shared/hooks/ui/useAntdMessage';
import { useI18n } from '@/shared/i18n';
import { showErrorMessage } from '@/shared/lib/error';
import { AppModal } from '@/shared/ui/modal/AppModal';
import { useCreateRole } from '@/logic/roles/useRoleMutations';
import { RoleForm } from './RoleForm';

interface RoleCreateModalProps {
  open: boolean;
  onClose: () => void;
}

export function RoleCreateModal({ open, onClose }: Readonly<RoleCreateModalProps>) {
  const { mutate: createRole, isPending } = useCreateRole();
  const message = useAntdMessage();
  const t = useI18n('features.roles');
  const tError = useI18n('error');

  const handleCreate = (values: { name: string; description?: string }) => {
    createRole(values, {
      onSuccess: () => {
        message.success(t('create.success'));
        onClose();
      },
      onError: err => showErrorMessage(message, err, tError, 'ROLE_CREATE_FAILED'),
    });
  };

  return (
    <AppModal title={t('create.title')} open={open} onClose={onClose}>
      <RoleForm onSubmit={handleCreate} loading={isPending} />
    </AppModal>
  );
}

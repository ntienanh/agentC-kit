import { useAntdMessage, useAppRouter, useNuqsSearchState } from '@/shared/hooks';
import { useI18n } from '@/shared/i18n';
import { APP_ROLE_NAMES } from '@/shared/models';
import { PERMISSION_SUBJECTS, useCrudPermissions } from '@/shared/rbac';
import { useTenantStore, useUserStore } from '@/shared/stores';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { useUserAdminMutation } from '@/logic/users/useUserAdminMutation';
import { useUserListQuery } from '@/logic/users/useUserListQuery';
import type { PublicProfile } from '../../models';
import type { UpdateUserByAdminRequest } from '../../services/user-management.types';

export function useUserListPage() {
  const tCommon = useTranslations('common');
  const t = useI18n('features.userManagement');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PublicProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<PublicProfile | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [selectedUser, setSelectedUser] = useState<PublicProfile | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [search, setSearch] = useNuqsSearchState('search', '');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { push } = useAppRouter();
  const message = useAntdMessage();
  const { canCreate, canRead, canUpdate, canDelete, canRestore } = useCrudPermissions(PERMISSION_SUBJECTS.USERS);
  const currentUser = useUserStore(s => s.user);
  const activeStoreId = useTenantStore(s => s.activeStoreId);
  const { updateUser, changeRole, deleteUser, restoreUser, forceLogout } = useUserAdminMutation();

  const { users, pagination, isLoading, isFetching, refetch } = useUserListQuery({
    page,
    limit: pageSize,
    search: search.trim() || undefined,
  });

  const roleName = currentUser?.role ? String(currentUser.role) : undefined;
  const isSuperAdmin = roleName?.toUpperCase() === APP_ROLE_NAMES.SUPER_ADMIN;

  const isMutating = useMemo(
    () => updateUser.isPending || changeRole.isPending || deleteUser.isPending || restoreUser.isPending,
    [updateUser.isPending, changeRole.isPending, deleteUser.isPending, restoreUser.isPending],
  );

  const handleEditSubmit = async (data: UpdateUserByAdminRequest & { roleId?: string }) => {
    if (!editingUser) return;

    const { roleId, ...profileData } = data;
    const id = String(editingUser.id);

    try {
      const hasProfileChanges =
        profileData.displayName !== undefined || profileData.phone !== undefined || profileData.avatar !== undefined;

      if (hasProfileChanges) {
        await updateUser.mutateAsync({ id, data: profileData });
      }

      const currentRoleId = editingUser.role?.id;
      const roleChanged = roleId && String(roleId) !== String(currentRoleId ?? '');
      if (roleChanged) {
        await changeRole.mutateAsync({ id, data: { roleId } });
      }

      message.success('User updated successfully');
      setEditingUser(null);
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;

    try {
      await deleteUser.mutateAsync({
        id: String(deletingUser.id),
        data: deleteReason.trim() ? { reason: deleteReason.trim() } : undefined,
      });

      message.success('User deleted successfully');
      setDeletingUser(null);
      setDeleteReason('');
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleRestore = async (userRecord: PublicProfile) => {
    try {
      await restoreUser.mutateAsync({ id: String(userRecord.id) });
      message.success('User restored successfully');
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Restore failed');
    }
  };

  const handleForceLogout = async (userRecord: PublicProfile) => {
    try {
      await forceLogout.mutateAsync({ userId: String(userRecord.id) });
      message.success('Sessions revoked successfully');
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Force logout failed');
    }
  };

  return {
    t,
    tCommon,
    push,
    message,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canRestore,
    currentUser,
    activeStoreId,
    isSuperAdmin,
    isMutating,
    createModalOpen,
    setCreateModalOpen,
    editingUser,
    setEditingUser,
    deletingUser,
    setDeletingUser,
    deleteReason,
    setDeleteReason,
    selectedUser,
    setSelectedUser,
    detailDrawerOpen,
    setDetailDrawerOpen,
    handleEditSubmit,
    handleDeleteConfirm,
    handleRestore,
    handleForceLogout,
    users,
    pagination,
    isLoading,
    isFetching,
    refetch,
    search,
    setSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
    updateUser,
  };
}

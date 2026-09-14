import { useAntdMessage, useAppRouter } from '@/shared/hooks';
import { APP_ROLE_NAMES } from '@/shared/models';
import { PERMISSION_ACTIONS, PERMISSION_SUBJECTS, permissionKey, usePermissions } from '@/shared/rbac';
import { useUserStore } from '@/shared/stores';
import { useState } from 'react';
import { useUserAdminMutation } from '@/logic/users/useUserAdminMutation';
import { useUserDetailQuery } from '@/logic/users/useUserDetailQuery';
import type { UpdateUserByAdminRequest } from '../../services/user-management.types';

export function useUserDetailPage(id: string) {
  const message = useAntdMessage();
  const router = useAppRouter();
  const { hasAllPermissions } = usePermissions();
  const canReadUser = hasAllPermissions([permissionKey(PERMISSION_SUBJECTS.USERS, PERMISSION_ACTIONS.READ)]);
  const canUpdateUser = hasAllPermissions([permissionKey(PERMISSION_SUBJECTS.USERS, PERMISSION_ACTIONS.UPDATE)]);
  const canDeleteUser = hasAllPermissions([permissionKey(PERMISSION_SUBJECTS.USERS, PERMISSION_ACTIONS.DELETE)]);
  const { user, isLoading, isError } = useUserDetailQuery(id);
  const { updateUser, changeRole, deleteUser, restoreUser, revokeUserSession, forceLogout } = useUserAdminMutation();
  const currentUser = useUserStore(s => s.user);
  const isSelf = String(currentUser?.id) === id;

  const roleName = currentUser?.role ? String(currentUser.role) : undefined;
  const isSuperAdmin = roleName?.toUpperCase() === APP_ROLE_NAMES.SUPER_ADMIN;

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleEditSubmit = async (data: UpdateUserByAdminRequest & { roleId?: string }) => {
    const { roleId, ...profileData } = data;
    try {
      const hasProfileChanges =
        profileData.displayName !== undefined || profileData.phone !== undefined || profileData.avatar !== undefined;

      if (hasProfileChanges) {
        await updateUser.mutateAsync({ id, data: profileData });
      }

      const currentRoleId = user?.role?.id;
      const roleChanged = roleId && String(roleId) !== String(currentRoleId ?? '');
      if (roleChanged) {
        await changeRole.mutateAsync({ id, data: { roleId } });
      }

      message.success('User updated successfully');
      setEditModalOpen(false);
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const handleRevokeSession = async (jti: string) => {
    try {
      await revokeUserSession.mutateAsync({ userId: id, jti });
      message.success('Session revoked successfully');
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Revoke session failed');
    }
  };

  const handleForceLogout = async () => {
    try {
      await forceLogout.mutateAsync({ userId: id });
      message.success('All sessions revoked');
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Force logout failed');
    }
  };

  const handleDeleteUser = async (reason: string) => {
    try {
      await deleteUser.mutateAsync({ id, data: reason ? { reason } : undefined });
      message.success('User deactivated successfully');
      router.push('/users');
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Delete user failed');
    }
  };

  const handleRestoreUser = async () => {
    try {
      await restoreUser.mutateAsync({ id });
      message.success('User account restored');
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Restore user failed');
    }
  };

  return {
    router,
    message,
    user,
    isLoading,
    isError,
    canReadUser,
    canUpdateUser,
    canDeleteUser,
    isSelf,
    isSuperAdmin,
    editModalOpen,
    setEditModalOpen,
    activeTab,
    setActiveTab,
    handleEditSubmit,
    handleRevokeSession,
    handleForceLogout,
    handleDeleteUser,
    handleRestoreUser,
    updateUser,
    changeRole,
    deleteUser,
    restoreUser,
    revokeUserSession,
  };
}

'use client';

import { useAntdMessage, useNuqsSearchState } from '@/shared/hooks';
import { useI18n } from '@/shared/i18n';
import { showErrorMessage } from '@/shared/lib/error';
import { APP_ROLE_NAMES } from '@/shared/models';
import { PERMISSION_SUBJECTS, useCrudPermissions } from '@/shared/rbac';
import { useUserStore } from '@/shared/stores';
import { useQuery } from '@tanstack/react-query';
import { Modal } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { useDeleteRole } from '@/logic/roles/useRoleMutations';
import type { RoleListItem } from '@/features/roles/models';
import { roleApi } from '@/features/roles/services/role.service';
import type { RoleListParams } from '@/features/roles/services/role.types';
import { ROLE_QUERY_KEYS } from '@/features/roles/utils';

export function useRolesLogic() {
  const message = useAntdMessage();
  const t = useI18n('features.roles');
  const tCommon = useI18n('common');
  const tError = useI18n('error');
  const { mutate: deleteRole } = useDeleteRole();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleListItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [search] = useNuqsSearchState('search', '');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { canCreate, canUpdate, canDelete } = useCrudPermissions(PERMISSION_SUBJECTS.ROLES);
  const { canRead: canReadPermissions } = useCrudPermissions(PERMISSION_SUBJECTS.PERMISSIONS);
  const user = useUserStore(state => state.user);
  const roleName = user?.role ? String(user.role).toUpperCase() : undefined;
  const isSuperAdmin = roleName === APP_ROLE_NAMES.SUPER_ADMIN;
  const canCreateRole = canCreate && isSuperAdmin;
  const canDeleteRole = canDelete && isSuperAdmin;

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ROLE_QUERY_KEYS.roles(),
    queryFn: async ({ signal }) => {
      const response = await roleApi.listRoles({ page: 1, limit: 200 } as RoleListParams, signal);
      const list = response?.data ?? [];
      return Array.isArray(list) ? list : [];
    },
  });

  const rolesList = useMemo(() => data ?? [], [data]);

  const handleDeleteRole = useCallback(
    (role: RoleListItem) => {
      if (!role?.id) return;

      if (role.isSystem) {
        message.warning(t('list.systemRoleDeleteBlocked'));
        return;
      }

      Modal.confirm({
        title: t('list.deleteConfirmTitle'),
        content: t('list.deleteConfirmDescription'),
        okText: tCommon('delete'),
        cancelText: tCommon('cancel'),
        okButtonProps: { danger: true },
        onOk: () =>
          new Promise<void>((resolve, reject) => {
            deleteRole(role.id, {
              onSuccess: () => {
                message.success(t('list.deleteSuccess'));
                if (selectedRole?.id === role.id) setDrawerOpen(false);
                resolve();
              },
              onError: error => {
                showErrorMessage(message, error, tError, 'RESOURCE_DELETE_FAILED');
                reject(error);
              },
            });
          }),
      });
    },
    [deleteRole, message, selectedRole?.id, t, tCommon, tError],
  );

  const openDetailDrawer = (role: RoleListItem) => {
    setSelectedRole(role);
    setDrawerOpen(true);
  };

  const filteredRoles = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return rolesList;

    return rolesList.filter(item => {
      const matchesName = item.name.toLowerCase().includes(term);
      const matchesDesc = item.description?.toLowerCase().includes(term) ?? false;
      return matchesName || matchesDesc;
    });
  }, [rolesList, search]);

  const total = filteredRoles.length;
  const paginatedRoles = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredRoles.slice(start, start + limit);
  }, [filteredRoles, page, limit]);

  return {
    rolesList,
    filteredRoles,
    paginatedRoles,
    total,
    isLoading,
    isFetching,
    refetch,
    showCreateModal,
    setShowCreateModal,
    selectedRole,
    setSelectedRole,
    drawerOpen,
    setDrawerOpen,
    search,
    page,
    setPage,
    limit,
    setLimit,
    canCreateRole,
    canDeleteRole,
    canUpdate,
    canReadPermissions,
    isSuperAdmin,
    handleDeleteRole,
    openDetailDrawer,
  };
}

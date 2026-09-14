'use client';

import { useAntdMessage, useNuqsSearchState } from '@/shared/hooks';
import { useI18n } from '@/shared/i18n';
import { showErrorMessage } from '@/shared/lib/error';
import { PERMISSION_SUBJECTS, useCrudPermissions } from '@/shared/rbac';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { permissionApi } from '@/features/permissions/services/permission.service';
import type { PermissionItem } from '@/features/permissions/types';
import { RBAC_QUERY_KEYS } from '@/features/permissions/utils/rbac-query-key.config';
import { getPermissionListColumns } from '@/features/permissions/components/utils/permission-list.column';

export function usePermissionsLogic() {
  const message = useAntdMessage();
  const tError = useI18n('error');
  const queryClient = useQueryClient();
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(PERMISSION_SUBJECTS.PERMISSIONS);

  const [search] = useNuqsSearchState('search', '');
  const [resourceFilter, setResourceFilter] = useNuqsSearchState('resource', '');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [editingPermission, setEditingPermission] = useState<PermissionItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: RBAC_QUERY_KEYS.permissions(),
    queryFn: async ({ signal }) => {
      const response = await permissionApi.listPermissions({}, signal);
      const raw = response.data ?? {};
      const permissions = Object.values(raw).flat();
      return permissions;
    },
  });

  const permissionsList = useMemo(() => data ?? [], [data]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { description?: string } }) =>
      permissionApi.updatePermission(id, data),
    onSuccess: () => {
      message.success('Permission updated successfully.');
      setEditingPermission(null);
      void queryClient.invalidateQueries({ queryKey: RBAC_QUERY_KEYS.permissions() });
    },
    onError: err => showErrorMessage(message, err, tError, 'PERMISSION_UPDATE_FAILED'),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) => permissionApi.createPermission(data),
    onSuccess: () => {
      message.success('Permission created successfully.');
      setShowCreateModal(false);
      void queryClient.invalidateQueries({ queryKey: RBAC_QUERY_KEYS.permissions() });
    },
    onError: err => showErrorMessage(message, err, tError, 'PERMISSION_CREATE_FAILED'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => permissionApi.deletePermission(id),
    onSuccess: () => {
      message.success('Permission deleted successfully.');
      void queryClient.invalidateQueries({ queryKey: RBAC_QUERY_KEYS.permissions() });
    },
    onError: err => showErrorMessage(message, err, tError, 'PERMISSION_DELETE_FAILED'),
  });

  const resourceOptions = useMemo(() => {
    const set = new Set<string>();
    permissionsList.forEach(p => {
      if (p.resource) set.add(p.resource);
    });
    return Array.from(set).map(res => ({ label: res, value: res }));
  }, [permissionsList]);

  const filteredPermissions = useMemo(() => {
    const term = search.toLowerCase().trim();
    return permissionsList.filter(item => {
      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.resource.toLowerCase().includes(term) ||
        item.action.toLowerCase().includes(term);

      const matchesResource = !resourceFilter || item.resource === resourceFilter;

      return matchesSearch && matchesResource;
    });
  }, [permissionsList, search, resourceFilter]);

  const total = filteredPermissions.length;
  const paginatedPermissions = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredPermissions.slice(start, start + limit);
  }, [filteredPermissions, page, limit]);

  const handleUpdate = (values: { name?: string; description?: string }) => {
    if (!editingPermission) return;
    updateMutation.mutate({ id: editingPermission.id, data: values });
  };

  const handleCreate = (values: { name?: string; description?: string }) => {
    if (!values.name) return;
    createMutation.mutate({ name: values.name, description: values.description });
  };

  const handleDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation],
  );

  const columns = useMemo(
    () =>
      getPermissionListColumns({
        onEdit: canUpdate ? item => setEditingPermission(item) : undefined,
        onDelete: canDelete ? id => handleDelete(id) : undefined,
      }),
    [canUpdate, canDelete, handleDelete],
  );

  return {
    canCreate,
    canUpdate,
    canDelete,
    isLoading,
    isFetching,
    refetch,
    search,
    resourceFilter,
    setResourceFilter,
    resourceOptions,
    page,
    setPage,
    limit,
    setLimit,
    total,
    paginatedPermissions,
    columns,
    editingPermission,
    setEditingPermission,
    showCreateModal,
    setShowCreateModal,
    handleUpdate,
    handleCreate,
    handleDelete,
    isUpdating: updateMutation.isPending,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

'use client';

import { AppCard } from '@/shared/ui/card/AppCard';
import { AppTable } from '@/shared/ui/table/AppTable';
import dayjs from '@/shared/utils/dayjs.util';
import { Alert, Skeleton, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Building2 } from 'lucide-react';
import { useUserStoreAssignmentsQuery } from '@/logic/users/useUserStoreAssignmentsQuery';
import type { UserStoreAssignment } from '../../services/user-management.types';

interface Props {
  userId: string;
}

const TENANT_ROLE_COLORS: Record<string, string> = {
  tenant_admin: 'gold',
  tenant_staff: 'blue',
  store_admin: 'gold',
  store_staff: 'blue',
};

const TENANT_ROLE_LABELS: Record<string, string> = {
  tenant_admin: 'Tenant Admin',
  tenant_staff: 'Tenant Staff',
  store_admin: 'Tenant Admin',
  store_staff: 'Tenant Staff',
};

const columns: ColumnsType<UserStoreAssignment> = [
  {
    title: 'Tenant',
    dataIndex: 'tenantName',
    key: 'tenantName',
    render: (_: string | null, record) => (
      <div className="flex flex-col gap-0.5">
        <Typography.Text strong className="text-xs leading-tight">
          {record.tenantName ?? record.storeName ?? record.tenantId ?? record.storeId}
        </Typography.Text>
        {(record.tenantSlug || record.storeSlug) && (
          <Typography.Text type="secondary" className="text-[11px] leading-tight">
            /{record.tenantSlug || record.storeSlug}
          </Typography.Text>
        )}
      </div>
    ),
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role',
    width: 150,
    render: (role: string, record) => {
      const label = TENANT_ROLE_LABELS[role] ?? role;
      const color = TENANT_ROLE_COLORS[role] ?? 'default';
      return (
        <div className="flex flex-wrap items-center gap-1.5">
          <Tag color={color} className="m-0! rounded-full! border-0! px-2.5! py-0.5! text-xs! font-semibold">
            {label}
          </Tag>
          {record.isPrimary && (
            <Tag color="geekblue" className="m-0! rounded-full! border-0! px-2! py-0.5! text-[11px]! font-semibold">
              Primary
            </Tag>
          )}
        </div>
      );
    },
  },
  {
    title: 'Assigned',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 120,
    render: (date: string) => (
      <Typography.Text className="text-muted-foreground font-mono text-xs">
        {dayjs(date).format('DD/MM/YY HH:mm')}
      </Typography.Text>
    ),
  },
];

const cardTitle = (
  <div className="flex items-center justify-between py-0.5">
    <div className="flex items-center gap-2">
      <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-md">
        <Building2 size={13} className="text-primary" />
      </div>
      <span className="text-foreground text-sm font-bold">Tenant Assignments</span>
    </div>
    <Typography.Text type="secondary" className="text-muted-foreground hidden text-xs! sm:inline">
      Per-tenant overlay roles
    </Typography.Text>
  </div>
);

export function UserTenantAssignmentsCard({ userId }: Readonly<Props>) {
  const { assignments, isLoading, isError } = useUserStoreAssignmentsQuery(userId);

  if (isLoading) {
    return (
      <AppCard title={cardTitle}>
        <Skeleton active paragraph={{ rows: 3 }} />
      </AppCard>
    );
  }

  if (isError) {
    return (
      <AppCard title={cardTitle}>
        <Alert
          type="error"
          showIcon
          message="Could not load tenant assignments"
          description="Please retry. If the problem persists, the user may have been deleted or you may lack permission."
          className="text-xs"
        />
      </AppCard>
    );
  }

  if (assignments.length === 0) {
    return (
      <AppCard title={cardTitle}>
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <div className="bg-muted/50 flex h-12 w-12 items-center justify-center rounded-full">
            <Building2 size={22} className="text-muted-foreground/50" />
          </div>
          <div className="space-y-1">
            <Typography.Text strong className="block text-sm">
              No tenant assignments
            </Typography.Text>
            <Typography.Text type="secondary" className="block max-w-[220px] text-xs leading-relaxed">
              This user has no per-tenant role. Access is governed by their base role only.
            </Typography.Text>
          </div>
        </div>
      </AppCard>
    );
  }

  return (
    <AppCard title={cardTitle}>
      <AppTable<UserStoreAssignment>
        ariaLabel="Tenant assignments"
        size="small"
        className="[&_.ant-table-thead_.ant-table-cell]:bg-muted/40! [&_.ant-table-cell]:px-3! [&_.ant-table-cell]:py-2! [&_.ant-table-cell]:align-middle [&_.ant-table-cell]:text-xs! [&_.ant-table-thead_.ant-table-cell]:py-2! [&_.ant-table-thead_.ant-table-cell]:text-xs! [&_.ant-table-thead_.ant-table-cell]:font-bold!"
        rowKey="id"
        columns={columns}
        dataSource={assignments}
        pagination={false}
        scroll={{ x: 'max-content' }}
      />
    </AppCard>
  );
}

export const UserStoreAssignmentsCard = UserTenantAssignmentsCard;

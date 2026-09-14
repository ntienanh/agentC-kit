'use client';

import { Select, Tooltip, Typography } from 'antd';
import { useRoles } from '@/logic/roles/useRoleQueries';

interface UserRoleSectionProps {
  currentRole: string;
  currentRoleId?: string;
  isSelf: boolean;
  onChangeRole: (roleId: string) => void;
  loading: boolean;
}

const USER_ROLE_SELECT_WIDTH = 200;

export function UserRoleSection({ currentRoleId, isSelf, onChangeRole, loading }: UserRoleSectionProps) {
  const { roles, isLoading: rolesLoading } = useRoles();

  const options = roles.map(r => ({ label: r.name, value: r.id }));

  return (
    <div className='flex flex-col gap-2'>
      <Typography.Text strong>Change role</Typography.Text>
      <Tooltip title={isSelf ? 'You cannot change your own role' : undefined}>
        <Select
          value={currentRoleId}
          options={options}
          onChange={onChangeRole}
          disabled={isSelf || loading}
          loading={loading || rolesLoading}
          style={{ width: USER_ROLE_SELECT_WIDTH }}
        />
      </Tooltip>
    </div>
  );
}

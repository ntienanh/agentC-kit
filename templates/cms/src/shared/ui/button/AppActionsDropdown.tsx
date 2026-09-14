'use client';

import { Button, Dropdown, type MenuProps } from 'antd';
import { MoreHorizontal } from 'lucide-react';

export interface AppActionsDropdownProps {
  items: MenuProps['items'];
  disabled?: boolean;
}

export function AppActionsDropdown({ items, disabled }: AppActionsDropdownProps) {
  if (!items || items.length === 0) return null;

  return (
    <div onClick={e => e.stopPropagation()} className='inline-flex items-center justify-center'>
      <Dropdown menu={{ items }} trigger={['click']} disabled={disabled}>
        <Button
          size='small'
          icon={<MoreHorizontal size={14} />}
          className='hover:border-primary hover:text-primary flex items-center justify-center rounded-lg shadow-2xs'
          aria-label='Actions menu'
        />
      </Dropdown>
    </div>
  );
}

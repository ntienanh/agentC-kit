'use client';

import { AppButton } from '@/shared/ui/button/AppButton';
import { Badge, Typography } from 'antd';
import { CheckSquare, X } from 'lucide-react';
import type { ReactNode } from 'react';

export interface AppTableSelectionBarProps {
  selectedCount: number;
  onClear: () => void;
  actions?: ReactNode;
  className?: string;
}

export function AppTableSelectionBar({
  selectedCount,
  onClear,
  actions,
  className = '',
}: Readonly<AppTableSelectionBarProps>) {
  if (selectedCount <= 0) return null;

  return (
    <div
      className={`bg-primary/10 border-primary/20 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-2.5 backdrop-blur-md ${className}`}
    >
      <div className='flex items-center gap-2'>
        <CheckSquare size={16} className='text-primary shrink-0' />
        <Typography.Text className='text-xs font-semibold'>
          Selected <Badge count={selectedCount} overflowCount={999} className='ms-1 me-1' /> items
        </Typography.Text>
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        {actions}
        <AppButton size='small' icon={<X size={14} />} onClick={onClear}>
          Deselect All
        </AppButton>
      </div>
    </div>
  );
}

'use client';

import { Badge, Button, Drawer } from 'antd';
import { SlidersHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';

export interface AppFilterDrawerProps {
  title?: string;
  open: boolean;
  onClose: () => void;
  onClearAll?: () => void;
  activeCount?: number;
  children: ReactNode;
  _triggerText?: string;
}

export function AppFilterDrawer({
  title = 'Filter options',
  open,
  onClose,
  onClearAll,
  activeCount = 0,
  children,
  _triggerText = 'Filter options',
}: Readonly<AppFilterDrawerProps>) {
  return (
    <Drawer
      title={
        <div className='flex items-center gap-2'>
          <SlidersHorizontal size={16} />
          <span>{title}</span>
          {activeCount > 0 && <Badge count={activeCount} size='small' className='ms-1' />}
        </div>
      }
      placement='top'
      height='auto'
      open={open}
      onClose={onClose}
      destroyOnClose
      extra={
        onClearAll && (
          <Button size='small' disabled={activeCount === 0} onClick={onClearAll}>
            Clear all
          </Button>
        )
      }
    >
      <div className='p-2'>{children}</div>
    </Drawer>
  );
}

export interface AppFilterTriggerButtonProps {
  activeCount: number;
  onClick: () => void;
  text?: string;
}

export function AppFilterTriggerButton({
  activeCount,
  onClick,
  text = 'Filter options',
}: Readonly<AppFilterTriggerButtonProps>) {
  return (
    <Badge count={activeCount} size='small' offset={[-4, 4]}>
      <Button
        icon={<SlidersHorizontal size={14} />}
        onClick={onClick}
        className={activeCount > 0 ? 'border-primary! text-primary!' : ''}
      >
        {text}
      </Button>
    </Badge>
  );
}

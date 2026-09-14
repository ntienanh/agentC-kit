'use client';

import { HEADER_MENU_KEYS } from '@/layouts/main-layout/configs/header.config';
import { useAutoBreadcrumb } from '@/shared/hooks/navigation/useAutoBreadcrumb';
import { useBreadcrumbContext } from '@/shared/hooks/navigation/useBreadcrumb';
import { useI18n } from '@/shared/i18n';
import { Breadcrumb } from '@/shared/sections/breadcrumb';
import { useUserStore } from '@/shared/stores';
import { AppCommandBar } from '@/shared/ui/command-bar/AppCommandBar';
import { AppNotificationBell } from '@/shared/ui/notification/AppNotificationBell';
import { KeyOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Dropdown, type MenuProps, Typography } from 'antd';
import dynamic from 'next/dynamic';
import { useState } from 'react';

const { Text } = Typography;

const ChangePasswordModal = dynamic(
  () => import('@/features/auth/components/ChangePasswordModal').then(module => module.ChangePasswordModal),
  { ssr: false },
);
const ViewProfileModal = dynamic(
  () => import('@/features/auth/components/ViewProfileModal').then(module => module.ViewProfileModal),
  { ssr: false },
);

interface HeaderContentProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const HeaderContent = ({ collapsed, setCollapsed }: HeaderContentProps) => {
  const tCommon = useI18n('common');
  const { user } = useUserStore();
  const { items } = useBreadcrumbContext();
  useAutoBreadcrumb();

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [viewProfileOpen, setViewProfileOpen] = useState(false);

  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === HEADER_MENU_KEYS.CHANGE_PASSWORD) setChangePasswordOpen(true);
    if (key === HEADER_MENU_KEYS.PROFILE) setViewProfileOpen(true);
  };

  const displayName = user?.displayName || tCommon('userMenuFallbackDisplayName');
  const avatarLetter = displayName?.[0]?.toUpperCase();

  return (
    <div className='flex h-full w-full items-center justify-between gap-2 px-4 sm:px-6 lg:px-8'>
      <div className='flex min-w-0 shrink items-center gap-2'>
        <Button
          type='text'
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className='shrink-0'
        />
        {items.length > 0 && (
          <div className='ms-1 hidden min-w-0 truncate xl:block'>
            <Breadcrumb items={items} />
          </div>
        )}
      </div>

      <div className='flex shrink-0 items-center gap-1.5 sm:gap-3'>
        <AppCommandBar />
        <AppNotificationBell />
        <Dropdown
          trigger={['click']}
          placement='bottomRight'
          arrow={false}
          menu={{
            items: [
              {
                key: 'user-info',
                label: (
                  <div className='py-1'>
                    <Text strong className='block'>
                      {displayName}
                    </Text>
                    {user?.email && (
                      <Text type='secondary' className='text-xs'>
                        {user.email}
                      </Text>
                    )}
                  </div>
                ),
                disabled: true,
              },
              { type: 'divider' },
              {
                key: HEADER_MENU_KEYS.PROFILE,
                icon: <UserOutlined />,
                label: tCommon('userMenuProfile'),
              },
              {
                key: HEADER_MENU_KEYS.CHANGE_PASSWORD,
                icon: <KeyOutlined />,
                label: tCommon('userMenuChangePassword'),
              },
            ],
            onClick: onMenuClick,
          }}
        >
          <div className='hover:bg-muted flex shrink-0 cursor-pointer items-center gap-2 rounded-md! px-2 py-1 transition-colors'>
            <Avatar
              icon={!avatarLetter ? <UserOutlined /> : undefined}
              size={32}
              className='bg-primary text-primary-foreground shrink-0'
            >
              {avatarLetter}
            </Avatar>
            <span className='hidden max-w-[120px] truncate text-sm font-medium lg:block'>{displayName}</span>
          </div>
        </Dropdown>
      </div>

      {changePasswordOpen && <ChangePasswordModal open onClose={() => setChangePasswordOpen(false)} />}
      {viewProfileOpen && <ViewProfileModal open onClose={() => setViewProfileOpen(false)} />}
    </div>
  );
};

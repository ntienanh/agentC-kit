const _dummyRoute = "[...all]";

const apiFetch = fetch;
'use client';

import { APP_CONFIG } from '@/configs/app/app.config';
import { APP_SIDEBAR_ACTIONS, APP_SIDEBAR_ITEMS } from '@/configs/app/features/shell-navigation.config';
import { AUTH_INTERNAL_ENDPOINTS, setLoggingOutFlag } from '@/features/auth';
import { useResponsive } from '@/shared/hooks';
import { useI18n } from '@/shared/i18n';
import { usePathname, useRouter } from '@/shared/i18n/navigation';
import { APP_ROLE_NAMES } from '@/shared/models';
import { usePermissions } from '@/shared/rbac';
import { UI_TIMING } from '@/shared/constants/ui.constants';
import { useTenantStore, useUserStore } from '@/shared/stores';
import { useQueryClient } from '@tanstack/react-query';
import { Menu } from 'antd';
import { useMemo, useState } from 'react';
import { mapToAntdMenu } from './utils/sidebar-menu.util';
import { filterSidebarItems, matchMenuByPath } from './utils/sidebar.util';

export function SidebarContent({
  collapsed,
  onItemClick,
}: {
  readonly collapsed: boolean;
  readonly onItemClick?: () => void;
}) {
  const router = useRouter();
  const tCommon = useI18n('common');
  const pathname = usePathname();
  const { isMobile } = useResponsive();
  const { clearUser, user } = useUserStore();
  const { setActiveTenantId, setActiveStoreId } = useTenantStore();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const [userOpenKeys, setUserOpenKeys] = useState<string[]>([]);

  const rawRole = user?.role;
  const roleName = typeof rawRole === 'string' ? rawRole : '';
  const isSuperAdmin = roleName.toUpperCase() === APP_ROLE_NAMES.SUPER_ADMIN;
  const baseRoleName = roleName.toUpperCase();

  const visibleItems = useMemo(
    () => filterSidebarItems(APP_SIDEBAR_ITEMS, isSuperAdmin, baseRoleName, hasPermission),
    [isSuperAdmin, baseRoleName, hasPermission],
  );

  const handleLogout = async () => {
    setLoggingOutFlag(true);

    await queryClient.cancelQueries();
    await apiFetch(AUTH_INTERNAL_ENDPOINTS.LOGOUT, { method: 'POST' });

    clearUser();
    useUserStore.persist.clearStorage();

    setActiveTenantId(null);
    setActiveStoreId(null);
    useTenantStore.persist.clearStorage();

    queryClient.clear();

    router.push(APP_CONFIG.routing.defaultUnauthenticatedRoute);

    setTimeout(() => setLoggingOutFlag(false), UI_TIMING.TRANSITION_MS);
  };

  const matched = useMemo(() => matchMenuByPath(visibleItems, pathname), [visibleItems, pathname]);

  const isMenuCollapsed = !isMobile && collapsed;
  const defaultOpenKeys = userOpenKeys.length > 0 ? userOpenKeys : matched.openKeys;
  const openKeys = isMenuCollapsed ? [] : defaultOpenKeys;

  const handleOpenChange = (keys: string[]) => {
    const latestOpenKey = keys.find(key => !openKeys.includes(key));
    setUserOpenKeys(latestOpenKey ? [latestOpenKey] : []);
  };

  const menuMode = !isMobile && collapsed ? 'vertical' : 'inline';

  return (
    <div className='flex h-full flex-col'>
      <div className='sidebar-menu-scroll flex-1 overflow-x-hidden overflow-y-auto'>
        <Menu
          mode={menuMode}
          triggerSubMenuAction={isMobile ? 'click' : 'hover'}
          selectedKeys={matched.selectedKey ? [matched.selectedKey] : []}
          openKeys={menuMode === 'inline' ? openKeys : undefined}
          onOpenChange={menuMode === 'inline' ? handleOpenChange : undefined}
          onClick={() => {
            if (isMobile) onItemClick?.();
          }}
          items={mapToAntdMenu(visibleItems)}
          style={{ borderRight: 'none' }}
        />
      </div>

      <div id='bottom-sidebar' className='border-divider mt-auto border-t'>
        <Menu
          mode={menuMode}
          selectable={false}
          items={[
            {
              key: 'logout',
              icon: APP_SIDEBAR_ACTIONS.logout.icon,
              label: tCommon('logout'),
              danger: true,
              onClick: handleLogout,
            },
          ]}
          style={{ borderRight: 'none' }}
        />
      </div>
    </div>
  );
}

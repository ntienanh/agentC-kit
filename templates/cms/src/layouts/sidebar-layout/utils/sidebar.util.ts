import { isFeatureEnabled } from '@/configs/app/app.config';
import type { AppFeatureKey } from '@/configs/app/app.config';
import type { SidebarItem } from '@/configs/app/features/shell-navigation.config';

export function matchMenuByPath(
  items: readonly SidebarItem[],
  pathname: string,
  parents: string[] = [],
): {
  selectedKey?: string;
  openKeys: string[];
} {
  for (const item of items) {
    if (item.href && pathname.startsWith(item.href)) {
      return {
        selectedKey: item.key,
        openKeys: parents,
      };
    }

    if (item.children) {
      const found = matchMenuByPath(item.children, pathname, [...parents, item.key]);
      if (found.selectedKey) return found;
    }
  }

  return { openKeys: [] };
}

export function filterSidebarItems(
  items: readonly SidebarItem[],
  isSuperAdmin: boolean,
  baseRoleName: string,
  hasPermission: (permission: string) => boolean,
): SidebarItem[] {
  return items
    .filter(item => {
      if (item.superAdminOnly && !isSuperAdmin) return false;
      if (item.excludeBaseRoles?.includes(baseRoleName)) return false;
      if (item.featureKey && !isFeatureEnabled(item.featureKey as AppFeatureKey)) return false;
      if (item.requiredPermission && !hasPermission(item.requiredPermission)) return false;
      return true;
    })
    .flatMap(item => {
      if (item.children && item.children.length > 0) {
        const filteredChildren = filterSidebarItems(item.children, isSuperAdmin, baseRoleName, hasPermission);
        if (filteredChildren.length === 1) {
          return filteredChildren;
        }
        return [
          {
            ...item,
            children: filteredChildren,
          },
        ];
      }
      return [item];
    })
    .filter(item => !item.children || item.children.length > 0);
}

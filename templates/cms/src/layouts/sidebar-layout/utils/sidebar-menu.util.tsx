import type { SidebarItem } from '@/configs/app/features/shell-navigation.config';
import { MenuProps } from 'antd';

import { SidebarLink } from '../sidebar-link';

export function mapToAntdMenu(items: readonly SidebarItem[]): MenuProps['items'] {
  return items.map(item => ({
    key: item.key,
    icon: item.icon,
    label: item.href ? <SidebarLink href={item.href} label={item.label} /> : <span>{item.label}</span>,
    children: item.children && item.children.length > 0 ? mapToAntdMenu(item.children) : undefined,
  }));
}

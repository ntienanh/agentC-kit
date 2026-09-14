'use client';

import { Grid } from 'antd';
export function useResponsive() {
  const screens = Grid.useBreakpoint();

  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = screens.lg;

  return {
    screens,
    isMobile,
    isTablet,
    isDesktop,
  };
}

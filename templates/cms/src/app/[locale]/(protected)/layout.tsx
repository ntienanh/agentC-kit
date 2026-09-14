'use client';

import { getDefaultAuthenticatedHref, isFeatureEnabled } from '@/configs/app/app.config';
import { matchFeatureByPathname } from '@/configs/app/features/feature-registry.config';
import { APP_TEMPLATE_CONFIG } from '@/configs/app/template';
import { AuthGuardProvider, AuthProvider } from '@/features/auth';
import { ErrorBoundary } from '@/layouts/errors-layout/ErrorBoundary';
import { HeaderContent } from '@/layouts/main-layout';
import { SidebarContent } from '@/layouts/sidebar-layout';
import { useResponsive } from '@/shared/hooks';
import { usePathname, useRouter } from '@/shared/i18n/navigation';
import { BreadcrumbProvider, NavigationLoadingProvider } from '@/shared/providers';
import { AppBackdrop } from '@/shared/ui/loading/AppBackdrop';
import { AppScrollToTop } from '@/shared/ui/button/AppScrollToTop';
import { Button, Drawer, Layout } from 'antd';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

const { Header, Content, Sider } = Layout;

export default function ProtectedLayout({ children }: { readonly children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { screens } = useResponsive();
  const isMobile = screens.md === false;
  const pathname = usePathname();
  const router = useRouter();
  const activeFeature = matchFeatureByPathname(pathname);
  const isBlockedFeature = activeFeature ? !isFeatureEnabled(activeFeature.key) : false;
  const brand = APP_TEMPLATE_CONFIG.brand;

  useEffect(() => {
    if (isBlockedFeature) {
      router.replace(getDefaultAuthenticatedHref());
    }
  }, [isBlockedFeature, router]);

  if (isBlockedFeature) {
    return <AppBackdrop />;
  }

  return (
    <AuthProvider>
      <AuthGuardProvider>
        <BreadcrumbProvider>
          <NavigationLoadingProvider>
            <Layout className='bg-background h-screen w-full overflow-hidden'>
              {!isMobile && (
                <Sider
                  width={260}
                  collapsedWidth={80}
                  collapsed={collapsed}
                  breakpoint='lg'
                  onBreakpoint={setCollapsed}
                  className='border-divider bg-card! border-r transition-all duration-300 ease-in-out'
                >
                  <div className='flex h-full flex-col'>
                    <div className='border-divider relative flex h-[52px] min-h-[52px] w-full flex-none items-center gap-2.5 overflow-hidden border-b px-4!'>
                      <Image
                        src='/logo1.png'
                        alt={brand.name}
                        width={28}
                        height={28}
                        className='flex-none rounded-md object-contain'
                        priority
                      />
                      {!collapsed && <span className='truncate text-sm font-semibold'>{brand.name}</span>}
                    </div>

                    <div className='flex-1 overflow-hidden'>
                      <SidebarContent collapsed={collapsed} />
                    </div>
                  </div>
                </Sider>
              )}

              {isMobile && (
                <Drawer
                  styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column' } }}
                  title={<div className='text-heading text-center text-lg font-semibold'>{brand.name}</div>}
                  open={collapsed}
                  onClose={() => setCollapsed(false)}
                  placement='left'
                  className='bg-card!'
                  classNames={{
                    header: 'border-divider border-b',
                  }}
                  extra={<Button onClick={() => setCollapsed(false)}>X</Button>}
                  closeIcon={false}
                >
                  <div className='flex-1 overflow-hidden'>
                    <SidebarContent collapsed={collapsed} onItemClick={() => setCollapsed(false)} />
                  </div>
                </Drawer>
              )}

              <Layout className='flex-1 overflow-hidden'>
                <Layout className='flex flex-col overflow-hidden'>
                  <Header className='border-divider bg-card flex h-[52px] max-h-[52px]! w-full flex-none items-center border-b px-0!'>
                    <HeaderContent collapsed={collapsed} setCollapsed={setCollapsed} />
                  </Header>

                  <Content className='bg-background m-0! flex flex-1 justify-center overflow-auto p-4 sm:p-5 lg:p-6!'>
                    <AppScrollToTop />
                    <section className='flex min-h-0 min-h-full w-full flex-1 flex-col'>
                      <ErrorBoundary>
                        <div className='flex min-h-0 w-full flex-1 flex-col'>{children}</div>
                      </ErrorBoundary>
                    </section>
                  </Content>
                </Layout>
              </Layout>
            </Layout>
          </NavigationLoadingProvider>
        </BreadcrumbProvider>
      </AuthGuardProvider>
    </AuthProvider>
  );
}

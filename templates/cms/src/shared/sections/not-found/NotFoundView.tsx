'use client';

import { APP_HREFS } from '@/configs/app/features/navigation.config';
import { routing } from '@/shared/i18n';
import { Button, Card, Typography } from 'antd';
import { ArrowLeft, Compass, LayoutDashboard, Sparkles } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

const { Title, Paragraph } = Typography;

interface NotFoundViewProps {
  dashboardHref: string;
}

export function NotFoundView({ dashboardHref }: Readonly<NotFoundViewProps>) {
  const pathname = usePathname();
  const router = useRouter();

  const localePrefix = pathname?.split('/')[1];
  const hasLocalePrefix = routing.locales.includes(localePrefix as (typeof routing.locales)[number]);
  const currentLocale = hasLocalePrefix ? (localePrefix as string) : 'en';

  const localizedDashboardHref =
    hasLocalePrefix && dashboardHref.startsWith('/') ? `/${localePrefix}${dashboardHref}` : dashboardHref;

  const quickLinks = [
    { label: 'Dashboard', href: `/${currentLocale}${APP_HREFS.DASHBOARD}` },
    { label: 'Users', href: `/${currentLocale}${APP_HREFS.USERS}` },
    { label: 'Roles', href: `/${currentLocale}${APP_HREFS.ROLES}` },
    { label: 'Permissions', href: `/${currentLocale}${APP_HREFS.PERMISSIONS}` },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
      className='dark:bg-slate-950 dark:from-slate-950 dark:to-slate-900'
    >
      <Card
        className='w-full max-w-lg overflow-hidden rounded-3xl border-0 text-center shadow-2xl'
        style={{
          borderRadius: 24,
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          padding: '16px 8px',
        }}
      >
        <div className='flex flex-col items-center space-y-5'>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Compass size={36} style={{ color: '#2563eb' }} className='animate-[spin_10s_linear_infinite]' />
          </div>

          <div className='space-y-1'>
            <div
              style={{
                fontSize: 64,
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #e11d48 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: 'monospace',
              }}
            >
              404
            </div>
            <Title level={3} style={{ margin: '8px 0 4px', fontWeight: 800 }}>
              Page Not Found
            </Title>
            <Paragraph type='secondary' style={{ margin: 0, fontSize: 13, maxWidth: 360 }}>
              Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển sang địa chỉ mới trong CMS Admin.
            </Paragraph>
          </div>

          <div className='flex w-full items-center justify-center gap-3 pt-2'>
            <Button
              size='large'
              icon={<ArrowLeft size={16} />}
              onClick={() => router.back()}
              style={{ borderRadius: 12, height: 42, fontSize: 13, fontWeight: 600, paddingLeft: 20, paddingRight: 20 }}
            >
              Quay lại
            </Button>

            <Button
              type='primary'
              size='large'
              icon={<LayoutDashboard size={16} />}
              onClick={() => router.push(localizedDashboardHref)}
              style={{
                borderRadius: 12,
                height: 42,
                fontSize: 13,
                fontWeight: 700,
                paddingLeft: 24,
                paddingRight: 24,
                background: '#2563eb',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              }}
            >
              Về Dashboard
            </Button>
          </div>

          <div className='mt-4 w-full space-y-2.5 border-t border-slate-200/80 pt-5'>
            <div className='flex items-center justify-center gap-1 text-[11px] font-bold tracking-wider text-slate-500 uppercase'>
              <Sparkles size={12} style={{ color: '#f59e0b' }} /> Quick Workspaces
            </div>
            <div className='flex flex-wrap items-center justify-center gap-2'>
              {quickLinks.map(link => (
                <Button
                  key={link.href}
                  type='text'
                  size='small'
                  onClick={() => router.push(link.href)}
                  style={{
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#64748b',
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

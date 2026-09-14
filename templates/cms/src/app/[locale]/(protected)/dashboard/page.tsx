'use client';

import { APP_HREFS } from '@/configs/app/features/navigation.config';
import { useDashboardLogic } from '@/logic/dashboard/useDashboardLogic';
import { useAppRouter } from '@/shared/hooks';
import { useUserStore } from '@/shared/stores';
import { AppPage } from '@/shared/ui/page/AppPage';
import { Card, Col, Row, Statistic, Tag, Typography } from 'antd';
import {
  Activity,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  Key,
  ShieldCheck,
  Users,
} from 'lucide-react';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const user = useUserStore(state => state.user);
  const router = useAppRouter();
  const userLabel = user?.displayName || user?.email || 'Administrator';

  const {
    usersCount,
    usersLoading,
    rolesCount,
    rolesLoading,
    permsCount,
    permsLoading,
    sessionsCount,
    sessionsLoading,
  } = useDashboardLogic();

  const metrics = [
    {
      title: 'Total Users',
      value: usersCount,
      loading: usersLoading,
      icon: <Users size={22} className='text-blue-500' />,
      href: APP_HREFS.USERS,
      badge: 'Active Accounts',
    },
    {
      title: 'Assigned Roles',
      value: rolesCount,
      loading: rolesLoading,
      icon: <ShieldCheck size={22} className='text-emerald-500' />,
      href: APP_HREFS.ROLES,
      badge: 'RBAC Matrices',
    },
    {
      title: 'CASL Permissions',
      value: permsCount,
      loading: permsLoading,
      icon: <Key size={22} className='text-amber-500' />,
      href: APP_HREFS.PERMISSIONS,
      badge: 'Security Rules',
    },
    {
      title: 'Active Sessions',
      value: sessionsCount,
      loading: sessionsLoading,
      icon: <Boxes size={22} className='text-purple-500' />,
      href: APP_HREFS.PROFILE_SESSIONS,
      badge: 'Security Audit',
    },
  ];

  return (
    <AppPage>
      <div className='flex flex-col gap-6'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-slate-900/60 dark:to-slate-800/60 rounded-2xl border border-blue-100/80 dark:border-slate-800 shadow-xs'>
          <div>
            <div className='flex items-center gap-2 mb-1'>
              <Tag color='blue' className='m-0 flex items-center gap-1 text-xs'>
                <Activity size={12} /> Core Engine Active
              </Tag>
              <Tag color='green' className='m-0 flex items-center gap-1 text-xs'>
                <CheckCircle2 size={12} /> Upstream Synchronized
              </Tag>
            </div>
            <Title level={3} className='!mb-1 !font-semibold'>
              Welcome back, {userLabel}
            </Title>
            <Text type='secondary'>
              Enterprise Core Administrative Dashboard with real-time RBAC telemetry.
            </Text>
          </div>
        </div>

        <Row gutter={[16, 16]}>
          {metrics.map((metric) => (
            <Col xs={24} sm={12} xl={6} key={metric.title}>
              <Card
                hoverable
                onClick={() => router.push(metric.href)}
                className='cursor-pointer transition-all duration-200 hover:shadow-md border-border/80'
              >
                <div className='flex items-start justify-between mb-2'>
                  <div className='p-2.5 rounded-xl bg-muted/50'>{metric.icon}</div>
                  <Tag className='m-0 text-[11px]'>{metric.badge}</Tag>
                </div>
                <Statistic
                  title={<span className='text-xs text-muted-foreground font-medium'>{metric.title}</span>}
                  value={metric.value}
                  loading={metric.loading}
                  className='[&_.ant-statistic-content-value]:text-2xl [&_.ant-statistic-content-value]:font-bold'
                />
                <div className='mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground hover:text-primary transition-colors'>
                  <span>Manage {metric.title.toLowerCase()}</span>
                  <ArrowUpRight size={14} />
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </AppPage>
  );
}

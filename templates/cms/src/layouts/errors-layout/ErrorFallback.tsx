'use client';

import type { EnhancedError, ErrorCategory } from '@/shared/lib/error/types';
import { BugOutlined, CloseCircleOutlined, HomeOutlined, InfoCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Collapse, Result, Space, Typography } from 'antd';
import { useTranslations } from 'next-intl';

const { Text, Title } = Typography;
const { Panel } = Collapse;

interface ErrorFallbackProps {
  error: EnhancedError;
  onRetry?: () => void;
  title?: string;
  message?: string;
  showDetails?: boolean;
  showHomeButton?: boolean;
}

export function ErrorFallback({
  error,
  onRetry,
  title,
  message,
  showDetails = process.env.NODE_ENV === 'development',
  showHomeButton = true,
}: ErrorFallbackProps) {
  const t = useTranslations('error');

  const errorTitle = title || getErrorTitle(error.category, t);
  const errorMessage = message || error.message || t('defaultMessage');

  return (
    <Result
      status='error'
      icon={<CloseCircleOutlined />}
      title={errorTitle}
      subTitle={errorMessage}
      extra={
        <Space orientation='vertical' size='middle' style={{ width: '100%' }}>
          {error.suggestedActions && error.suggestedActions.length > 0 && (
            <div style={{ textAlign: 'left', maxWidth: 400, margin: '0 auto' }}>
              <Text strong>{t('suggestedActions')}:</Text>
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                {error.suggestedActions.map((action, index) => (
                  <li key={index}>
                    <Text>{action}</Text>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Space>
            {onRetry && (
              <Button type='primary' icon={<ReloadOutlined />} onClick={onRetry}>
                {t('retry')}
              </Button>
            )}
            {showHomeButton && (
              <Button icon={<HomeOutlined />} href='/'>
                {t('goHome')}
              </Button>
            )}
          </Space>

          {showDetails && (
            <Collapse ghost style={{ marginTop: 16, maxWidth: 600, margin: '16px auto 0' }}>
              <Panel
                header={
                  <Space>
                    <BugOutlined />
                    <Text>{t('technicalDetails')}</Text>
                  </Space>
                }
                key='1'
              >
                <div style={{ textAlign: 'left', background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
                  <Text code style={{ display: 'block', marginBottom: 8 }}>
                    Error ID: {error.id}
                  </Text>
                  <Text code style={{ display: 'block', marginBottom: 8 }}>
                    Category: {error.category}
                  </Text>
                  <Text code style={{ display: 'block', marginBottom: 8 }}>
                    Type: {error.type}
                  </Text>
                  <Text code style={{ display: 'block', marginBottom: 8 }}>
                    Severity: {error.severity}
                  </Text>
                  <Text code style={{ display: 'block', marginBottom: 8 }}>
                    Code: {error.code}
                  </Text>
                  {error.context?.component && (
                    <Text code style={{ display: 'block', marginBottom: 8 }}>
                      Component: {error.context.component}
                    </Text>
                  )}
                  {error.stack && (
                    <pre
                      style={{
                        marginTop: 8,
                        fontSize: 12,
                        overflow: 'auto',
                        maxHeight: 200,
                      }}
                    >
                      {error.stack}
                    </pre>
                  )}
                </div>
              </Panel>
            </Collapse>
          )}

          {error.helpLinks && error.helpLinks.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <InfoCircleOutlined style={{ marginRight: 8 }} />
              <Text>{t('needHelp')}:</Text>
              <Space size='small' style={{ marginLeft: 8 }}>
                {error.helpLinks.map((link, index) => (
                  <a key={index} href={link} target='_blank' rel='noopener noreferrer'>
                    {t('helpLink')} {index + 1}
                  </a>
                ))}
              </Space>
            </div>
          )}
        </Space>
      }
    />
  );
}

export function InlineErrorFallback({ error, onRetry }: Pick<ErrorFallbackProps, 'error' | 'onRetry'>) {
  const t = useTranslations('error');

  return (
    <div style={{ padding: 16, textAlign: 'center' }}>
      <CloseCircleOutlined style={{ fontSize: 24, color: '#ff4d4f', marginBottom: 8 }} />
      <Title level={5}>{error.message}</Title>
      {onRetry && (
        <Button type='primary' size='small' icon={<ReloadOutlined />} onClick={onRetry}>
          {t('retry')}
        </Button>
      )}
    </div>
  );
}

export function NetworkErrorFallback({ onRetry }: { onRetry?: () => void }) {
  const t = useTranslations('error');

  return (
    <Result
      status='warning'
      title={t('network.title')}
      subTitle={t('network.message')}
      extra={
        onRetry && (
          <Button type='primary' icon={<ReloadOutlined />} onClick={onRetry}>
            {t('retry')}
          </Button>
        )
      }
    />
  );
}

export function AuthErrorFallback() {
  const t = useTranslations('error');

  return (
    <Result
      status='403'
      title={t('auth.title')}
      subTitle={t('auth.message')}
      extra={
        <Button type='primary' href='/signin'>
          {t('auth.loginAgain')}
        </Button>
      }
    />
  );
}

function getErrorTitle(category: ErrorCategory, t: (key: string) => string): string {
  const titles: Record<ErrorCategory, string> = {
    network: t('network.title'),
    api: t('api.title'),
    validation: t('validation.title'),
    business_logic: t('business.title'),
    authentication: t('auth.title'),
    authorization: t('forbidden.title'),
    client: t('client.title'),
    server: t('server.title'),
    unknown: t('unknown.title'),
  };

  return titles[category] || t('defaultTitle');
}

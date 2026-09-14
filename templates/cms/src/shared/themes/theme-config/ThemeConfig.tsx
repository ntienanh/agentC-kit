'use client';

import { THEME_PRESETS, type ThemeMode } from '@/configs/app/design-system';
import { useThemeEnhanced } from '@/shared/hooks/useThemeEnhanced';
import { Card, Divider, Radio, Space, Switch, Typography } from 'antd';

const { Title, Text } = Typography;

interface ThemeConfigProps {
  showSystemSync?: boolean;
  showPreview?: boolean;
  compact?: boolean;
}

export function ThemeConfig({ showSystemSync = true, showPreview = true, compact = false }: ThemeConfigProps) {
  const { theme, setTheme, systemTheme, isSystemThemeSupported, setSystemThemeMode, isMatchingSystem } =
    useThemeEnhanced();

  const handleThemeChange = (value: ThemeMode) => {
    setTheme(value);
  };

  if (compact) {
    return (
      <Space orientation='vertical' size='small' style={{ width: '100%' }}>
        <Radio.Group value={theme} onChange={e => handleThemeChange(e.target.value)} size='small'>
          <Space orientation='vertical' size='small'>
            {THEME_PRESETS.map(preset => (
              <Radio key={preset.id} value={preset.id}>
                <Space size='small'>
                  {showPreview && (
                    <div className='flex gap-1'>
                      <div
                        className='h-3 w-3 rounded-full border'
                        style={{ backgroundColor: preset.preview.primary }}
                      />
                      <div
                        className='h-3 w-3 rounded-full border'
                        style={{ backgroundColor: preset.preview.background }}
                      />
                    </div>
                  )}
                  <Text>{preset.name}</Text>
                </Space>
              </Radio>
            ))}
          </Space>
        </Radio.Group>

        {showSystemSync && isSystemThemeSupported && (
          <>
            <Divider style={{ margin: '8px 0' }} />
            <Space align='center'>
              <Switch size='small' checked={isMatchingSystem} onChange={setSystemThemeMode} />
              <Text type='secondary' style={{ fontSize: '12px' }}>
                Match system ({systemTheme})
              </Text>
            </Space>
          </>
        )}
      </Space>
    );
  }

  return (
    <Card title='Theme Settings' size='small'>
      <Space orientation='vertical' size='middle' style={{ width: '100%' }}>
        <div>
          <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
            Choose Theme
          </Title>
          <Radio.Group value={theme} onChange={e => handleThemeChange(e.target.value)}>
            <Space orientation='vertical' size='middle'>
              {THEME_PRESETS.map(preset => (
                <Radio key={preset.id} value={preset.id}>
                  <Space size='middle'>
                    {showPreview && (
                      <div className='flex gap-1'>
                        <div
                          className='h-4 w-4 rounded-full border'
                          style={{ backgroundColor: preset.preview.primary }}
                        />
                        <div
                          className='h-4 w-4 rounded-full border'
                          style={{ backgroundColor: preset.preview.background }}
                        />
                      </div>
                    )}
                    <div>
                      <div className='font-medium'>{preset.name}</div>
                      <Text type='secondary' style={{ fontSize: '12px' }}>
                        {preset.description}
                      </Text>
                    </div>
                  </Space>
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </div>

        {showSystemSync && isSystemThemeSupported && (
          <>
            <Divider />
            <div>
              <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
                System Integration
              </Title>
              <Space align='center'>
                <Switch checked={isMatchingSystem} onChange={setSystemThemeMode} />
                <Text>Match system preference ({systemTheme} mode)</Text>
              </Space>
              <Text type='secondary' style={{ fontSize: '12px', display: 'block', marginTop: 4 }}>
                Automatically sync with your system's theme setting
              </Text>
            </div>
          </>
        )}
      </Space>
    </Card>
  );
}

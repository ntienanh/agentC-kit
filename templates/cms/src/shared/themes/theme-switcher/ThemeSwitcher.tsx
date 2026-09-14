'use client';

import { THEME_PRESETS, type ThemeMode } from '@/configs/app/design-system';
import { useTheme } from '@/shared/providers';
import { Select } from 'antd';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const options = THEME_PRESETS.map(preset => ({
    label: (
      <div className='flex items-center gap-2'>
        <div className='flex gap-1'>
          <div className='h-4 w-4 rounded-full border' style={{ backgroundColor: preset.preview.primary }} />
          <div className='h-4 w-4 rounded-full border' style={{ backgroundColor: preset.preview.background }} />
        </div>
        <div>
          <div className='font-medium'>{preset.name}</div>
          <div className='text-muted-foreground text-xs'>{preset.description}</div>
        </div>
      </div>
    ),
    value: preset.id,
  }));

  return (
    <Select
      value={theme}
      onChange={(value: ThemeMode) => setTheme(value)}
      options={options}
      style={{ width: 280 }}
      placeholder='Select theme'
    />
  );
}

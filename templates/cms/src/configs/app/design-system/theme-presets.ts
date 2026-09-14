
import type { ThemeMode } from './theme.config';

export interface ThemePreset {
  id: ThemeMode;
  name: string;
  description: string;
  preview: {
    primary: string;
    background: string;
    foreground: string;
  };
  tags: string[];
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'light',
    name: 'Slate Light',
    description: 'Neutral-first CMS theme with a restrained blue accent',
    preview: {
      primary: '#2563EB',
      background: '#F6F8FB',
      foreground: '#111827',
    },
    tags: ['slate', 'neutral', 'professional'],
  },
  {
    id: 'claude',
    name: 'Claude Legacy',
    description: 'Warm editorial theme retained for existing user preferences',
    preview: {
      primary: '#D97757',
      background: '#FAFAF8',
      foreground: '#1F1F1E',
    },
    tags: ['legacy', 'warm', 'editorial'],
  },
  {
    id: 'modern',
    name: 'Modern Slate',
    description: 'Premium SaaS/CMS system with calm surfaces and clear hierarchy',
    preview: {
      primary: '#2563EB',
      background: '#F6F8FB',
      foreground: '#111827',
    },
    tags: ['default', 'modern', 'slate'],
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Modern Slate dark mode for low-light environments',
    preview: {
      primary: '#6985FF',
      background: '#0F172A',
      foreground: '#F9FAFB',
    },
    tags: ['dark', 'slate', 'low-light'],
  },
];

export function getPresetById(id: ThemeMode): ThemePreset | undefined {
  return THEME_PRESETS.find(preset => preset.id === id);
}

export function getPresetsByTag(tag: string): ThemePreset[] {
  return THEME_PRESETS.filter(preset => preset.tags.includes(tag));
}

export const DEFAULT_PRESET: ThemeMode = 'modern';

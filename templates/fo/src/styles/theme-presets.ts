import { semanticThemeHsl, oklchTokens } from './palette';

export type ThemePresetKey = 'neutral' | 'slate' | 'zinc';

export interface ThemePreset {
  id: ThemePresetKey;
  name: string;
  description: string;
  hslVars: Record<string, string>;
  oklchVars: Record<string, string>;
}

export const themePresets: Record<ThemePresetKey, ThemePreset> = {
  neutral: {
    id: 'neutral',
    name: 'Neutral (Default)',
    description: 'Clean balanced enterprise aesthetic with neutral palette',
    hslVars: semanticThemeHsl.light,
    oklchVars: {
      '--color-bg': oklchTokens.lightBg,
      '--color-text': oklchTokens.lightText,
      '--color-card': oklchTokens.lightCard,
      '--color-accent': oklchTokens.lightAccent,
    },
  },
  slate: {
    id: 'slate',
    name: 'Slate (Cool Corporate)',
    description: 'Executive cool dark theme with slate tones',
    hslVars: semanticThemeHsl.dark,
    oklchVars: {
      '--color-bg': oklchTokens.darkBg,
      '--color-text': 'oklch(0.95 0.015 80)',
      '--color-card': oklchTokens.darkCard,
      '--color-accent': oklchTokens.sanctuaryGold,
    },
  },
  zinc: {
    id: 'zinc',
    name: 'Zinc (Modern Minimal)',
    description: 'High-contrast modern enterprise zinc surface styling',
    hslVars: {
      ...semanticThemeHsl.dark,
      accent: '240 5% 65%',
      accentPress: '240 5% 55%',
    },
    oklchVars: {
      '--color-bg': oklchTokens.sanctuaryBg,
      '--color-text': 'oklch(0.96 0.02 85)',
      '--color-card': oklchTokens.sanctuaryCard,
      '--color-accent': oklchTokens.sanctuaryGold,
    },
  },
};

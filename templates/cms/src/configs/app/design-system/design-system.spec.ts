import { describe, expect, it } from 'vitest';
import { DEFAULT_PRESET, THEME_PRESETS, getPresetById, getPresetsByTag } from './theme-presets';
import { DEFAULT_THEME, themeColors } from './theme.config';
import {
  COLOR_TOKEN_TO_CSS_VAR,
  COLOR_TOKEN_TO_TAILWIND,
  COLOR_TOKEN_TO_THEME_VAR,
  DESIGN_TOKENS_MANIFEST,
  getPrimitiveEntries,
  getRadiusPx,
  getShadowValue,
  getSpacingPx,
} from './tokens.config';

describe('design-system configs', () => {
  it('exports manifest and maps token to CSS/Tailwind vars correctly', () => {
    expect(DESIGN_TOKENS_MANIFEST).toBeDefined();
    expect(COLOR_TOKEN_TO_CSS_VAR.primary).toBeDefined();
    expect(COLOR_TOKEN_TO_TAILWIND.primary).toBeDefined();
    expect(COLOR_TOKEN_TO_THEME_VAR.primary).toBeDefined();
  });

  it('retrieves primitive entries and helper functions with fallbacks', () => {
    const entries = getPrimitiveEntries();
    expect(entries.length).toBeGreaterThan(0);

    expect(getRadiusPx('md', 6)).toBe(8);
    expect(getSpacingPx('md', 16)).toBe(16);
    expect(getShadowValue('card')).toBeDefined();

    const dummyRadii = DESIGN_TOKENS_MANIFEST.radii as Record<string, { px?: number }>;
    dummyRadii['customNoPx'] = {};
    expect(getRadiusPx('customNoPx' as never, 99)).toBe(99);

    const dummySpacing = DESIGN_TOKENS_MANIFEST.spacing as Record<string, { px?: number }>;
    dummySpacing['customNoPx'] = {};
    expect(getSpacingPx('customNoPx' as never, 88)).toBe(88);
  });

  it('retrieves theme presets accurately', () => {
    expect(DEFAULT_PRESET).toBe('modern');
    expect(THEME_PRESETS.length).toBeGreaterThan(0);

    const preset = getPresetById('light');
    expect(preset?.id).toBe('light');

    const darkPresets = getPresetsByTag('dark');
    expect(darkPresets.length).toBeGreaterThan(0);
  });

  it('provides default theme and theme colors config', () => {
    expect(DEFAULT_THEME).toBe('modern');
    expect(themeColors.modern).toBeDefined();
    expect(themeColors.dark).toBeDefined();
  });
});

import { describe, expect, it } from 'vitest';
import { brandPalette, semanticThemeHsl, oklchTokens } from './palette';

describe('FO Design System Palette & Tokens', () => {
  it('defines the core brand color scales with 50-950 values', () => {
    expect(brandPalette.accent[500]).toBe('#99583e');
    expect(brandPalette.accent[600]).toBe('#844731');
    expect(brandPalette.sand[100]).toBe('#faf6f0');
    expect(brandPalette.espresso[900]).toBe('#2b241f');
    expect(brandPalette.sage[500]).toBe('#609062');
    expect(brandPalette.roseDust[500]).toBe('#d77a74');
  });

  it('defines light theme semantic HSL tokens', () => {
    expect(semanticThemeHsl.light.background).toBe('38 40% 95%');
    expect(semanticThemeHsl.light.foreground).toBe('27 22% 16%');
    expect(semanticThemeHsl.light.accent).toBe('20 34% 45%');
    expect(semanticThemeHsl.light.accentPress).toBe('20 34% 38%');
  });

  it('defines OKLCH Japanese Zen sanctuary tokens', () => {
    expect(oklchTokens.sanctuaryBg).toBe('oklch(0.185 0.015 75)');
    expect(oklchTokens.sanctuaryGold).toBe('oklch(0.785 0.115 82)');
    expect(oklchTokens.darkBg).toBe('oklch(0.282 0.027 50)');
  });
});

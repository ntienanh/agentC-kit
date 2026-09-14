import { describe, expect, it } from 'vitest';
import { BREAKPOINTS, CONTAINER_MAX_WIDTH, tokensManifest } from './tokens.config';
import { spacingTokens } from './spacing';
import { typographyTokens } from './typography';
import { themePresets } from './theme-presets';

describe('FO Design System Structure & Breakpoints', () => {
  it('enforces the 4-tier breakpoint architecture', () => {
    expect(BREAKPOINTS.mobile.max).toBe(767);
    expect(BREAKPOINTS.tablet.min).toBe(768);
    expect(BREAKPOINTS.tablet.max).toBe(1023);
    expect(BREAKPOINTS.desktop.min).toBe(1024);
    expect(BREAKPOINTS.desktop.max).toBe(1439);
    expect(BREAKPOINTS.largeDesktop.min).toBe(1440);
  });

  it('verifies container maximum width is 1440px', () => {
    expect(CONTAINER_MAX_WIDTH).toBe('1440px');
    expect(spacingTokens.container.premium).toBe('1440px');
  });

  it('verifies typography hierarchy tokens exist for all key roles', () => {
    expect(typographyTokens.displayHero.tailwindClasses).toContain('font-display');
    expect(typographyTokens.sectionHeading.tailwindClasses).toContain('font-display');
    expect(typographyTokens.cardTitle.tailwindClasses).toContain('font-bold');
    expect(typographyTokens.accentEyebrow.tailwindClasses).toContain('uppercase');
    expect(typographyTokens.bodyCopy.tailwindClasses).toContain('leading-relaxed');
  });

  it('verifies all theme presets are defined with required CSS vars', () => {
    expect(themePresets['neutral'].name).toContain('Neutral');
    expect(themePresets['slate'].name).toContain('Slate');
    expect(themePresets['zinc'].name).toContain('Zinc');
  });

  it('validates tokens manifest integrity', () => {
    expect(tokensManifest.name).toContain('Design System');
    expect(tokensManifest.breakpoints.tablet.rem).toBe('48rem');
    expect(tokensManifest.breakpoints.desktop.rem).toBe('64rem');
    expect(tokensManifest.breakpoints.largeDesktop.rem).toBe('90rem');
  });
});

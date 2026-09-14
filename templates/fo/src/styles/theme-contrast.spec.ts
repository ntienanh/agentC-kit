import { describe, expect, it } from 'vitest';
import { brandPalette } from './palette';

function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

function getRelativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map(val => {
    const sRGB = val / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function calculateContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getRelativeLuminance(hexToRgb(hex1));
  const lum2 = getRelativeLuminance(hexToRgb(hex2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

describe('FO Theme WCAG 2.2 AA Contrast Compliance', () => {
  const backgroundLinen = brandPalette.sand[100];
  const foregroundEspresso = brandPalette.espresso[900];
  const mutedText = brandPalette.espresso[500];
  const primaryAccent = brandPalette.accent[500];
  const whiteText = '#FFFFFF';

  it('verifies primary heading text on linen background meets WCAG AAA (>= 7:1)', () => {
    const ratio = calculateContrastRatio(foregroundEspresso, backgroundLinen);
    expect(ratio).toBeGreaterThanOrEqual(7.0);
  });

  it('verifies body muted text on linen background meets WCAG AA (>= 4.5:1)', () => {
    const ratio = calculateContrastRatio(mutedText, backgroundLinen);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('verifies white button text on terracotta accent meets WCAG AA Large / CTA standards (>= 3.5:1)', () => {
    const ratio = calculateContrastRatio(whiteText, primaryAccent);
    expect(ratio).toBeGreaterThanOrEqual(3.5);
  });

  it('verifies dark theme text contrast meets WCAG AA (>= 4.5:1)', () => {
    const darkBg = brandPalette.espresso[950];
    const lightText = brandPalette.sand[50];
    const ratio = calculateContrastRatio(lightText, darkBg);
    expect(ratio).toBeGreaterThanOrEqual(10.0);
  });
});

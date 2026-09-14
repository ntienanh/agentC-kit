import { describe, expect, it } from 'vitest';
import { themeColors, type ThemeColors, type ThemeMode } from './theme.config';

const MINIMUM_AA_CONTRAST = 4.5;

const contrastPairs: ReadonlyArray<{
  foreground: keyof ThemeColors;
  background: keyof ThemeColors;
}> = [
  { foreground: 'heading', background: 'background' },
  { foreground: 'foreground', background: 'background' },
  { foreground: 'foreground', background: 'card' },
  { foreground: 'mutedForeground', background: 'card' },
  { foreground: 'primaryForeground', background: 'primary' },
  { foreground: 'primaryForeground', background: 'primaryHover' },
  { foreground: 'primary', background: 'card' },
  { foreground: 'primary', background: 'accent' },
  { foreground: 'success', background: 'successBg' },
  { foreground: 'warning', background: 'warningBg' },
  { foreground: 'error', background: 'errorBg' },
  { foreground: 'info', background: 'infoBg' },
];

function relativeLuminance(hexColor: string): number {
  const channels = hexColor
    .slice(1)
    .match(/.{2}/g)
    ?.map(channel => Number.parseInt(channel, 16) / 255)
    .map(channel => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));

  if (!channels || channels.length !== 3) {
    throw new Error(`Expected a six-digit hex color, received: ${hexColor}`);
  }

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(firstColor: string, secondColor: string): number {
  const firstLuminance = relativeLuminance(firstColor);
  const secondLuminance = relativeLuminance(secondColor);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

describe.each(Object.entries(themeColors) as Array<[ThemeMode, ThemeColors]>)(
  '%s theme contrast',
  (themeName, colors) => {
    it.each(contrastPairs)('$foreground on $background meets WCAG AA', ({ foreground, background }) => {
      const ratio = contrastRatio(colors[foreground], colors[background]);

      expect(ratio, `${themeName}: ${foreground} on ${background} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(
        MINIMUM_AA_CONTRAST,
      );
    });
  },
);

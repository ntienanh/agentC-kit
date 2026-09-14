export const spacingBase = 4;

export const spacingScale = {
  0: '0px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
} as const;

export const spacingPx = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
} as const;

export function getSpacingPx(step: keyof typeof spacingPx): number {
  return spacingPx[step];
}

export function getSpacingRem(step: keyof typeof spacingScale): string {
  return spacingScale[step];
}

export const radii = {
  none: '0px',
  sm: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
} as const;

export const radiiPx = {
  none: 0,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
} as const;

export function getRadiusPx(name: keyof typeof radiiPx): number {
  return radiiPx[name];
}

export const typographyScale = {
  xs: { fontSize: '0.75rem', lineHeight: '1rem', fontSizePx: 12, lineHeightPx: 16 },
  sm: { fontSize: '0.875rem', lineHeight: '1.25rem', fontSizePx: 14, lineHeightPx: 20 },
  base: { fontSize: '1rem', lineHeight: '1.5rem', fontSizePx: 16, lineHeightPx: 24 },
  lg: { fontSize: '1.125rem', lineHeight: '1.75rem', fontSizePx: 18, lineHeightPx: 28 },
  xl: { fontSize: '1.25rem', lineHeight: '1.75rem', fontSizePx: 20, lineHeightPx: 28 },
  '2xl': { fontSize: '1.5rem', lineHeight: '2rem', fontSizePx: 24, lineHeightPx: 32 },
  '3xl': { fontSize: '1.875rem', lineHeight: '2.25rem', fontSizePx: 30, lineHeightPx: 36 },
  '4xl': { fontSize: '2.25rem', lineHeight: '2.5rem', fontSizePx: 36, lineHeightPx: 40 },
  '5xl': { fontSize: '3rem', lineHeight: '1.16', fontSizePx: 48, lineHeightPx: 56 },
} as const;

export const fontFamilies = {
  sans: 'var(--font-sans, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif)',
  serif: 'var(--font-serif, ui-serif, Georgia, Cambria, "Times New Roman", Times, serif)',
  mono: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace)',
} as const;

export const fontWeights = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
} as const;

export const containerWidths = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1440px',
  narrow: '1024px',
  premium: '1440px',
} as const;

export const containerWidthsPx = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1440,
  narrow: 1024,
  premium: 1440,
} as const;

export const designManifest = {
  baseUnit: spacingBase,
  spacing: spacingScale,
  spacingPx,
  radii,
  radiiPx,
  typography: typographyScale,
  fontFamilies,
  fontWeights,
  containerWidths,
  containerWidthsPx,
} as const;

export type SpacingScale = typeof spacingScale;
export type SpacingPx = typeof spacingPx;
export type Radii = typeof radii;
export type RadiiPx = typeof radiiPx;
export type TypographyScale = typeof typographyScale;
export type FontFamilies = typeof fontFamilies;
export type FontWeights = typeof fontWeights;
export type ContainerWidths = typeof containerWidths;
export type DesignManifest = typeof designManifest;

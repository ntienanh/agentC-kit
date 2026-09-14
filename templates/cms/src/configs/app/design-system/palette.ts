export { brandPalette, modernSlatePalette, palette } from '@/shared/styles/palette';

export const oklchTokens = {
  primary: 'oklch(58% 0.23 255)',
  background: 'oklch(98% 0.005 240)',
  card: 'oklch(100% 0 0)',
  border: 'oklch(88% 0.01 240)',
} as const;

export type OklchTokenKey = keyof typeof oklchTokens;

export const OKLCH_CSS_VARS = {
  '--primary': oklchTokens.primary,
  '--background': oklchTokens.background,
  '--card': oklchTokens.card,
  '--border': oklchTokens.border,
} as const;


import manifest from './tokens.manifest.json';
import { brandPalette, semanticThemeHsl, oklchTokens } from './palette';

export type BreakpointTier = 'mobile' | 'tablet' | 'desktop' | 'largeDesktop' | 'ultraWide';

export const BREAKPOINTS = {
  mobile: { min: 0, max: 767, tailwind: '' },
  tablet: { min: 768, max: 1023, tailwind: 'md' },
  desktop: { min: 1024, max: 1439, tailwind: 'lg' },
  largeDesktop: { min: 1440, max: 1599, tailwind: 'xl' },
  ultraWide: { min: 1600, max: Infinity, tailwind: '2xl' },
} as const;

export const CONTAINER_MAX_WIDTH = manifest.spacing.containerMaxWidth;

export const tokensManifest = manifest;

export function getThemeColor(role: keyof typeof semanticThemeHsl.light, mode: 'light' | 'dark' = 'light'): string {
  return `hsl(${semanticThemeHsl[mode][role]})`;
}

export function getOklchColor(token: keyof typeof oklchTokens): string {
  return oklchTokens[token];
}

export function getBrandColor<T extends keyof typeof brandPalette, S extends keyof (typeof brandPalette)[T]>(
  scale: T,
  shade: S
): string {
  return (brandPalette[scale] as Record<string, string>)[shade as unknown as string];
}

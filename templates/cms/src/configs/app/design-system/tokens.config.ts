import manifest from './tokens.manifest.json';

export const DESIGN_TOKENS_MANIFEST = manifest;

export type SemanticColorToken = keyof typeof DESIGN_TOKENS_MANIFEST.colors;
export type RadiusToken = keyof typeof DESIGN_TOKENS_MANIFEST.radii;
export type SpacingToken = keyof typeof DESIGN_TOKENS_MANIFEST.spacing;
export type FontToken = keyof typeof DESIGN_TOKENS_MANIFEST.fonts;
export type ShadowToken = keyof typeof DESIGN_TOKENS_MANIFEST.shadows;

export const COLOR_TOKEN_TO_CSS_VAR = Object.fromEntries(
  Object.entries(DESIGN_TOKENS_MANIFEST.colors).map(([token, spec]) => [token, spec.cssVar]),
) as Record<SemanticColorToken, string>;

export const COLOR_TOKEN_TO_TAILWIND = Object.fromEntries(
  Object.entries(DESIGN_TOKENS_MANIFEST.colors).map(([token, spec]) => [token, spec.tailwind]),
) as Record<SemanticColorToken, string>;

export const COLOR_TOKEN_TO_THEME_VAR = Object.fromEntries(
  Object.entries(DESIGN_TOKENS_MANIFEST.colors).map(([token, spec]) => [token, spec.themeVar]),
) as Record<SemanticColorToken, string>;

export function getPrimitiveEntries() {
  return [
    ...Object.entries(DESIGN_TOKENS_MANIFEST.radii).map(([token, spec]) => ({
      group: 'radii' as const,
      token,
      ...spec,
    })),
    ...Object.entries(DESIGN_TOKENS_MANIFEST.spacing).map(([token, spec]) => ({
      group: 'spacing' as const,
      token,
      ...spec,
    })),
    ...Object.entries(DESIGN_TOKENS_MANIFEST.fonts).map(([token, spec]) => ({
      group: 'fonts' as const,
      token,
      ...spec,
    })),
    ...Object.entries(DESIGN_TOKENS_MANIFEST.shadows).map(([token, spec]) => ({
      group: 'shadows' as const,
      token,
      ...spec,
    })),
  ];
}

export function getRadiusPx(token: RadiusToken, fallback: number): number {
  return DESIGN_TOKENS_MANIFEST.radii[token].px ?? fallback;
}

export function getSpacingPx(token: SpacingToken, fallback: number): number {
  return DESIGN_TOKENS_MANIFEST.spacing[token].px ?? fallback;
}

export function getShadowValue(token: ShadowToken): string {
  return DESIGN_TOKENS_MANIFEST.shadows[token].value;
}

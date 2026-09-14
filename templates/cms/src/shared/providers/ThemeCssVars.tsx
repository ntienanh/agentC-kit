import {
  COLOR_TOKEN_TO_CSS_VAR,
  DEFAULT_THEME,
  DESIGN_TOKENS_MANIFEST,
  OKLCH_CSS_VARS,
  themeColors,
  type ThemeColors,
  type ThemeMode,
} from '@/configs/app/design-system';

function generateOklchVarsString(): string {
  return Object.entries(OKLCH_CSS_VARS)
    .map(([cssVar, value]) => `${cssVar}: ${value};`)
    .join('\n    ');
}

function generateCssVarsString(colors: ThemeColors): string {
  return Object.entries(COLOR_TOKEN_TO_CSS_VAR)
    .map(([token, cssVar]) => {
      const value = colors[token as keyof ThemeColors];
      return value ? `${cssVar}: ${value};` : '';
    })
    .filter(Boolean)
    .join('\n    ');
}

function generatePrimitiveVarsString() {
  const { typography } = DESIGN_TOKENS_MANIFEST;

  return [
    ...Object.values(DESIGN_TOKENS_MANIFEST.radii).map(spec => `${spec.runtimeVar}: ${spec.value};`),
    ...Object.values(DESIGN_TOKENS_MANIFEST.spacing).map(spec => `${spec.runtimeVar}: ${spec.value};`),
    ...Object.values(DESIGN_TOKENS_MANIFEST.fonts).map(spec => `${spec.runtimeVar}: ${spec.value};`),
    ...Object.values(typography.fontSize).map(spec => `${spec.runtimeVar}: ${spec.value};`),
    ...Object.values(typography.lineHeight).map(spec => `${spec.runtimeVar}: ${spec.value};`),
    ...Object.values(typography.fontWeight).map(spec => `${spec.runtimeVar}: ${spec.value};`),
    ...Object.values(DESIGN_TOKENS_MANIFEST.shadows).map(spec => `${spec.runtimeVar}: ${spec.value};`),
    '--radius: var(--token-radius-base);',
  ].join('\n    ');
}

export function ThemeCssVars({ mode = DEFAULT_THEME }: { readonly mode?: ThemeMode }) {
  const cssVars = generateCssVarsString(themeColors[mode]);
  const primitiveVars = generatePrimitiveVarsString();
  const oklchVars = generateOklchVarsString();

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          :root {
            ${primitiveVars}
            ${cssVars}
            ${oklchVars}
          }
          
          .theme-claude {
            color-scheme: light;
          }
          
          .theme-light {
            color-scheme: light;
          }
          
          .theme-modern {
            color-scheme: light;
          }
          
          .theme-dark {
            color-scheme: dark;
          }
        `,
      }}
    />
  );
}

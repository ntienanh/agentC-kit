import { brandColors, statusPalettes } from '../palette.js';
import { radii } from '../manifest.js';
import { semanticTokens } from '../semantic.js';
import type { ThemeMode } from '../semantic.js';

export function getTailwindCssVariables(mode: ThemeMode = 'light'): Record<string, string> {
  const current = semanticTokens[mode];
  const surface = current.surface;
  const status = current.status;

  return {
    '--color-brand-primary': brandColors.brandPrimary,
    '--color-brand-hover': brandColors.brandHover,
    '--color-brand-active': brandColors.brandActive,
    '--color-brand-muted': brandColors.brandMuted,
    '--color-background': surface.background,
    '--color-foreground': surface.foreground,
    '--color-card': surface.card,
    '--color-card-foreground': surface.cardForeground,
    '--color-popover': surface.popover,
    '--color-popover-foreground': surface.popoverForeground,
    '--color-border': surface.border,
    '--color-divider': surface.divider,
    '--color-input': surface.border,
    '--color-ring': brandColors.brandPrimary,
    '--color-muted': surface.muted,
    '--color-muted-foreground': surface.mutedForeground,
    '--color-accent': surface.accent,
    '--color-accent-foreground': surface.accentForeground,
    '--color-primary': surface.primary,
    '--color-primary-foreground': surface.primaryForeground,
    '--color-destructive': surface.destructive,
    '--color-destructive-foreground': surface.destructiveForeground,
    '--color-status-success': statusPalettes.success.base,
    '--color-status-warning': statusPalettes.warning.base,
    '--color-status-error': statusPalettes.error.base,
    '--color-status-info': statusPalettes.info.base,
    '--color-badge-success-bg': status.success.badgeBg,
    '--color-badge-success-text': status.success.badgeText,
    '--color-badge-success-border': status.success.badgeBorder,
    '--color-badge-warning-bg': status.warning.badgeBg,
    '--color-badge-warning-text': status.warning.badgeText,
    '--color-badge-warning-border': status.warning.badgeBorder,
    '--color-badge-error-bg': status.error.badgeBg,
    '--color-badge-error-text': status.error.badgeText,
    '--color-badge-error-border': status.error.badgeBorder,
    '--color-badge-info-bg': status.info.badgeBg,
    '--color-badge-info-text': status.info.badgeText,
    '--color-badge-info-border': status.info.badgeBorder,
    '--radius-sm': radii.sm,
    '--radius-md': radii.md,
    '--radius-lg': radii.lg,
    '--radius-xl': radii.xl,
    '--radius-full': radii.full,
    '--radius': radii.lg,
  };
}

export function getTailwindCssVariablesString(mode: ThemeMode = 'light'): string {
  const variables = getTailwindCssVariables(mode);
  const entries = Object.entries(variables).map(([key, value]) => `  ${key}: ${value};`);
  const selector = mode === 'dark' ? '.dark' : ':root';
  return `${selector} {\n${entries.join('\n')}\n}`;
}

import { brandColors, neutralSlate, statusPalettes } from './palette.js';

export type ThemeMode = 'light' | 'dark';

export type SemanticStatusType = 'success' | 'warning' | 'error' | 'info';

export interface SemanticStatusBadgeToken {
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  solidBg: string;
  solidText: string;
}

export interface SemanticSurfaceTokens {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  border: string;
  divider: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  primary: string;
  primaryForeground: string;
  destructive: string;
  destructiveForeground: string;
}

export interface SemanticTokens {
  mode: ThemeMode;
  status: Record<SemanticStatusType, SemanticStatusBadgeToken>;
  surface: SemanticSurfaceTokens;
}

export const lightSemanticStatusTokens: Record<SemanticStatusType, SemanticStatusBadgeToken> = {
  success: {
    badgeBg: statusPalettes.success[50],
    badgeText: statusPalettes.success[700],
    badgeBorder: statusPalettes.success[200],
    solidBg: statusPalettes.success[600],
    solidText: '#FFFFFF',
  },
  warning: {
    badgeBg: statusPalettes.warning[50],
    badgeText: statusPalettes.warning[700],
    badgeBorder: statusPalettes.warning[200],
    solidBg: statusPalettes.warning[600],
    solidText: '#FFFFFF',
  },
  error: {
    badgeBg: statusPalettes.error[50],
    badgeText: statusPalettes.error[700],
    badgeBorder: statusPalettes.error[200],
    solidBg: statusPalettes.error[600],
    solidText: '#FFFFFF',
  },
  info: {
    badgeBg: statusPalettes.info[50],
    badgeText: statusPalettes.info[700],
    badgeBorder: statusPalettes.info[200],
    solidBg: statusPalettes.info[600],
    solidText: '#FFFFFF',
  },
} as const;

export const darkSemanticStatusTokens: Record<SemanticStatusType, SemanticStatusBadgeToken> = {
  success: {
    badgeBg: 'rgba(6, 78, 59, 0.25)',
    badgeText: statusPalettes.success[300],
    badgeBorder: 'rgba(52, 211, 153, 0.3)',
    solidBg: statusPalettes.success[600],
    solidText: '#FFFFFF',
  },
  warning: {
    badgeBg: 'rgba(120, 53, 15, 0.25)',
    badgeText: statusPalettes.warning[300],
    badgeBorder: 'rgba(251, 191, 36, 0.3)',
    solidBg: statusPalettes.warning[600],
    solidText: '#FFFFFF',
  },
  error: {
    badgeBg: 'rgba(127, 29, 29, 0.25)',
    badgeText: statusPalettes.error[300],
    badgeBorder: 'rgba(248, 113, 113, 0.3)',
    solidBg: statusPalettes.error[600],
    solidText: '#FFFFFF',
  },
  info: {
    badgeBg: 'rgba(12, 74, 110, 0.25)',
    badgeText: statusPalettes.info[300],
    badgeBorder: 'rgba(56, 189, 248, 0.3)',
    solidBg: statusPalettes.info[600],
    solidText: '#FFFFFF',
  },
} as const;

export const lightSemanticSurfaceTokens: SemanticSurfaceTokens = {
  background: '#F6F8FB',
  foreground: neutralSlate[900],
  card: '#FFFFFF',
  cardForeground: neutralSlate[900],
  popover: '#FFFFFF',
  popoverForeground: neutralSlate[900],
  border: neutralSlate[200],
  divider: neutralSlate[100],
  muted: neutralSlate[100],
  mutedForeground: neutralSlate[500],
  accent: brandColors.brandMuted,
  accentForeground: brandColors.brandPrimary,
  primary: brandColors.brandPrimary,
  primaryForeground: brandColors.brandForeground,
  destructive: statusPalettes.error[600],
  destructiveForeground: '#FFFFFF',
};

export const darkSemanticSurfaceTokens: SemanticSurfaceTokens = {
  background: neutralSlate[900],
  foreground: neutralSlate[100],
  card: neutralSlate[950],
  cardForeground: neutralSlate[100],
  popover: neutralSlate[900],
  popoverForeground: neutralSlate[100],
  border: neutralSlate[700],
  divider: neutralSlate[800],
  muted: neutralSlate[800],
  mutedForeground: neutralSlate[400],
  accent: 'rgba(37, 99, 235, 0.15)',
  accentForeground: '#93C5FD',
  primary: brandColors.brandPrimary,
  primaryForeground: brandColors.brandForeground,
  destructive: statusPalettes.error[500],
  destructiveForeground: '#FFFFFF',
};

export const semanticTokens: Record<ThemeMode, SemanticTokens> = {
  light: {
    mode: 'light',
    status: lightSemanticStatusTokens,
    surface: lightSemanticSurfaceTokens,
  },
  dark: {
    mode: 'dark',
    status: darkSemanticStatusTokens,
    surface: darkSemanticSurfaceTokens,
  },
};

export function getSemanticTokens(mode: ThemeMode = 'light'): SemanticTokens {
  return semanticTokens[mode];
}

export function getSemanticStatusTokens(mode: ThemeMode = 'light'): Record<SemanticStatusType, SemanticStatusBadgeToken> {
  return semanticTokens[mode].status;
}

export function getStatusBadgeToken(mode: ThemeMode, status: SemanticStatusType): SemanticStatusBadgeToken {
  return semanticTokens[mode].status[status];
}

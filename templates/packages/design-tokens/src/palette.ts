export const brandColors = {
  brandPrimary: '#2563EB',
  brandHover: '#1D4ED8',
  brandActive: '#1E40AF',
  brandMuted: '#EFF6FF',
  brandForeground: '#FFFFFF',
} as const;

export const brandPrimary = brandColors.brandPrimary;
export const brandHover = brandColors.brandHover;
export const brandActive = brandColors.brandActive;

export const neutralSlate = {
  50: '#F8FAFC',
  100: '#F1F5F9',
  200: '#E2E8F0',
  300: '#CBD5E1',
  400: '#94A3B8',
  500: '#64748B',
  600: '#475569',
  700: '#334155',
  800: '#1E293B',
  900: '#0F172A',
  950: '#020617',
} as const;

export const slateScale = neutralSlate;

export const statusSuccess = {
  50: '#ECFDF5',
  100: '#D1FAE5',
  200: '#A7F3D0',
  300: '#6EE7B7',
  400: '#34D399',
  500: '#10B981',
  600: '#059669',
  700: '#047857',
  800: '#065F46',
  900: '#064E3B',
  950: '#022C22',
  base: '#10B981',
  light: '#ECFDF5',
  dark: '#047857',
} as const;

export const statusWarning = {
  50: '#FFFBEB',
  100: '#FEF3C7',
  200: '#FDE68A',
  300: '#FCD34D',
  400: '#FBBF24',
  500: '#F59E0B',
  600: '#D97706',
  700: '#B45309',
  800: '#92400E',
  900: '#78350F',
  950: '#451A03',
  base: '#F59E0B',
  light: '#FFFBEB',
  dark: '#B45309',
} as const;

export const statusError = {
  50: '#FEF2F2',
  100: '#FEE2E2',
  200: '#FECACA',
  300: '#FCA5A5',
  400: '#F87171',
  500: '#EF4444',
  600: '#DC2626',
  700: '#B91C1C',
  800: '#991B1B',
  900: '#7F1D1D',
  950: '#450A0A',
  base: '#EF4444',
  light: '#FEF2F2',
  dark: '#B91C1C',
} as const;

export const statusInfo = {
  50: '#F0F9FF',
  100: '#E0F2FE',
  200: '#BAE6FD',
  300: '#7DD3FC',
  400: '#38BDF8',
  500: '#0EA5E9',
  600: '#0284C7',
  700: '#0369A1',
  800: '#075985',
  900: '#0C4A6E',
  950: '#082F49',
  base: '#0EA5E9',
  light: '#F0F9FF',
  dark: '#0369A1',
} as const;

export const statusPalettes = {
  success: statusSuccess,
  warning: statusWarning,
  error: statusError,
  info: statusInfo,
} as const;

export const statusBaseColors = {
  success: statusSuccess.base,
  warning: statusWarning.base,
  error: statusError.base,
  info: statusInfo.base,
} as const;

export type BrandColors = typeof brandColors;
export type NeutralSlate = typeof neutralSlate;
export type SlateScale = typeof slateScale;
export type StatusPalettes = typeof statusPalettes;
export type StatusColorScale = typeof statusSuccess;

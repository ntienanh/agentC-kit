import { brandColors, statusPalettes } from '../palette.js';
import { radiiPx } from '../manifest.js';
import { semanticTokens } from '../semantic.js';
import type { ThemeMode } from '../semantic.js';

export interface AntdGlobalToken {
  colorPrimary: string;
  colorPrimaryHover: string;
  colorPrimaryActive: string;
  colorLink: string;
  colorLinkHover: string;
  borderRadius: number;
  borderRadiusSM: number;
  borderRadiusLG: number;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  fontSizeHeading1: number;
  fontSizeHeading2: number;
  fontSizeHeading3: number;
  fontSizeHeading4: number;
  fontSizeHeading5: number;
  colorInfo: string;
  colorSuccess: string;
  colorWarning: string;
  colorError: string;
  colorBgBase: string;
  colorBgContainer: string;
  colorBgElevated: string;
  colorBgMask: string;
  colorTextBase: string;
  colorTextHeading: string;
  colorTextSecondary: string;
  colorTextTertiary: string;
  colorTextQuaternary: string;
  colorBorder: string;
  colorBorderSecondary: string;
  colorSplit: string;
  colorBgContainerDisabled: string;
  colorFillSecondary: string;
  colorFillTertiary: string;
  controlItemBgHover: string;
  controlItemBgActive: string;
  controlOutline: string;
  controlHeight: number;
}

export interface AntdComponentTokens {
  Button?: Record<string, unknown>;
  Input?: Record<string, unknown>;
  InputNumber?: Record<string, unknown>;
  Select?: Record<string, unknown>;
  DatePicker?: Record<string, unknown>;
  Table?: Record<string, unknown>;
  Layout?: Record<string, unknown>;
  Card?: Record<string, unknown>;
  Modal?: Record<string, unknown>;
  Pagination?: Record<string, unknown>;
  Tabs?: Record<string, unknown>;
  Tag?: Record<string, unknown>;
  Menu?: Record<string, unknown>;
  Timeline?: Record<string, unknown>;
  [key: string]: Record<string, unknown> | undefined;
}

export interface AntdThemeConfig {
  cssVar?: { key: string };
  token: AntdGlobalToken;
  components: AntdComponentTokens;
}

export function getAntdThemeConfig(mode: ThemeMode = 'light'): AntdThemeConfig {
  const currentSemantic = semanticTokens[mode];
  const surface = currentSemantic.surface;
  const isDark = mode === 'dark';

  const token: AntdGlobalToken = {
    colorPrimary: brandColors.brandPrimary,
    colorPrimaryHover: brandColors.brandHover,
    colorPrimaryActive: brandColors.brandActive,
    colorLink: brandColors.brandPrimary,
    colorLinkHover: brandColors.brandHover,
    borderRadius: radiiPx.lg,
    borderRadiusSM: radiiPx.md,
    borderRadiusLG: radiiPx['2xl'],
    fontFamily: 'var(--token-font-sans), var(--font-sans), system-ui, sans-serif',
    fontSize: 14,
    lineHeight: 1.5,
    fontSizeHeading1: 28,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 18,
    fontSizeHeading5: 16,
    colorInfo: statusPalettes.info.base,
    colorSuccess: statusPalettes.success.base,
    colorWarning: statusPalettes.warning.base,
    colorError: statusPalettes.error.base,
    colorBgBase: surface.background,
    colorBgContainer: surface.card,
    colorBgElevated: surface.popover,
    colorBgMask: isDark ? 'rgba(2, 6, 23, 0.72)' : 'rgba(17, 24, 39, 0.42)',
    colorTextBase: surface.foreground,
    colorTextHeading: isDark ? '#F9FAFB' : '#111827',
    colorTextSecondary: surface.mutedForeground,
    colorTextTertiary: isDark ? '#94A3B8' : '#6B7280',
    colorTextQuaternary: isDark ? '#64748B' : '#9CA3AF',
    colorBorder: surface.border,
    colorBorderSecondary: surface.divider,
    colorSplit: surface.divider,
    colorBgContainerDisabled: isDark ? '#1E293B' : '#F3F4F6',
    colorFillSecondary: isDark ? '#172033' : '#F8FAFC',
    colorFillTertiary: isDark ? '#1E293B' : '#F1F5F9',
    controlItemBgHover: isDark ? '#1E293B' : '#EFF6FF',
    controlItemBgActive: surface.accent,
    controlOutline: brandColors.brandPrimary,
    controlHeight: 40,
  };

  const components: AntdComponentTokens = {
    Button: {
      controlHeight: 40,
      borderRadius: radiiPx.lg,
      primaryShadow: 'none',
      primaryColor: '#FFFFFF',
      defaultBg: surface.card,
      defaultBorderColor: surface.border,
      defaultHoverBg: surface.muted,
      defaultHoverBorderColor: brandColors.brandPrimary,
      contentFontSize: 14,
      fontWeight: 500,
    },
    Input: {
      controlHeight: 40,
      borderRadius: radiiPx.lg,
      activeBorderColor: brandColors.brandPrimary,
      hoverBorderColor: brandColors.brandPrimary,
      activeBg: surface.card,
      hoverBg: surface.card,
    },
    InputNumber: {
      controlHeight: 40,
      borderRadius: radiiPx.lg,
      activeBorderColor: brandColors.brandPrimary,
      hoverBorderColor: brandColors.brandPrimary,
      activeBg: surface.card,
      hoverBg: surface.card,
    },
    Select: {
      controlHeight: 40,
      borderRadius: radiiPx.lg,
      colorPrimary: brandColors.brandPrimary,
    },
    DatePicker: {
      controlHeight: 40,
      borderRadius: radiiPx.lg,
      activeBorderColor: brandColors.brandPrimary,
      hoverBorderColor: brandColors.brandPrimary,
      activeBg: surface.card,
      hoverBg: surface.card,
    },
    Table: {
      headerBg: surface.muted,
      headerColor: surface.foreground,
      headerSortActiveBg: surface.divider,
      headerSortHoverBg: surface.divider,
      bodySortBg: surface.background,
      rowHoverBg: surface.muted,
      rowSelectedBg: surface.accent,
      rowSelectedHoverBg: surface.accent,
      rowExpandedBg: surface.background,
      borderColor: surface.divider,
      cellPaddingBlockSM: 12,
      cellPaddingInlineSM: 12,
      cellFontSizeSM: 14,
      headerBorderRadius: radiiPx.md,
    },
    Layout: {
      bodyBg: surface.background,
      headerBg: surface.card,
      siderBg: surface.card,
    },
    Card: {
      colorBgContainer: surface.card,
      headerBg: surface.card,
      actionsBg: surface.muted,
      extraColor: brandColors.brandPrimary,
      borderRadiusLG: radiiPx.lg,
    },
    Modal: {
      contentBg: surface.card,
      headerBg: surface.card,
      footerBg: surface.card,
      titleColor: token.colorTextHeading,
    },
    Pagination: {
      itemBg: surface.card,
      itemLinkBg: surface.card,
      itemActiveBg: surface.accent,
      itemActiveColor: brandColors.brandPrimary,
      itemActiveColorHover: brandColors.brandHover,
      itemInputBg: surface.card,
    },
    Tabs: {
      itemColor: surface.mutedForeground,
      itemActiveColor: brandColors.brandPrimary,
      itemHoverColor: brandColors.brandHover,
      itemSelectedColor: brandColors.brandPrimary,
    },
    Tag: {
      defaultBg: surface.muted,
      defaultColor: surface.foreground,
    },
    Menu: {
      itemBg: surface.card,
      subMenuItemBg: surface.card,
      popupBg: surface.card,
      itemSelectedBg: surface.accent,
      itemSelectedColor: brandColors.brandPrimary,
      itemHoverBg: surface.muted,
      itemHoverColor: surface.foreground,
      itemColor: surface.mutedForeground,
      activeBarBorderWidth: 0,
      itemBorderRadius: radiiPx.md,
      itemHeight: 42,
      itemMarginInline: 8,
    },
    Timeline: {
      dotBorderWidth: 2,
    },
  };

  return {
    cssVar: { key: 'cms' },
    token,
    components,
  };
}

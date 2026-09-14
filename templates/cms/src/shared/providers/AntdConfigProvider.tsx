'use client';

import { getRadiusPx, getShadowValue, themeColors, type ThemeColors } from '@/configs/app/design-system';
import { useThemeStore } from '@/shared/stores';
import { hexToRgba } from '@/shared/styles/palette';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { App, ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';

function buildGlobalToken(t: ThemeColors, s: { info: string; success: string; warning: string; error: string }) {
  return {
    colorPrimary: t.primary,
    colorPrimaryHover: t.primaryHover,
    colorPrimaryActive: t.primary,
    colorLink: t.primary,
    colorLinkHover: t.primaryHover,
    borderRadius: getRadiusPx('base', 8),
    borderRadiusSM: getRadiusPx('sm', 6),
    borderRadiusLG: getRadiusPx('lg', 16),
    fontFamily: 'var(--token-font-sans), var(--font-sans), system-ui, sans-serif',
    fontSize: 14,
    lineHeight: 1.5,
    fontSizeHeading1: 28,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 18,
    fontSizeHeading5: 16,
    lineHeightHeading1: 1.25,
    lineHeightHeading2: 1.25,
    lineHeightHeading3: 1.25,
    lineHeightHeading4: 1.25,
    lineHeightHeading5: 1.25,
    colorInfo: s.info,
    colorSuccess: s.success,
    colorWarning: s.warning,
    colorError: s.error,
    colorBgBase: t.background,
    colorBgContainer: t.card,
    colorBgElevated: t.popover,
    colorBgMask: t.overlay,
    colorTextBase: t.foreground,
    colorTextHeading: t.heading,
    colorTextSecondary: t.mutedForeground,
    colorTextTertiary: t.textSubtle,
    colorTextPlaceholder: t.mutedForeground,
    colorTextQuaternary: t.disabledForeground,
    colorTextDisabled: t.disabledForeground,
    colorBorder: t.border,
    colorBorderSecondary: t.divider,
    colorSplit: t.divider,
    colorBgContainerDisabled: t.disabled,
    colorFillSecondary: t.surfaceSubtle,
    colorFillTertiary: t.surfaceMuted,
    controlItemBgHover: t.secondary,
    controlItemBgActive: t.accent,
    controlOutline: t.focus,
    boxShadowSecondary: getShadowValue('overlay'),
    fontWeightStrong: 600,
    controlHeight: 40,
  };
}

function buildInputTokens(t: ThemeColors, activeBorder: string, activeShadow: string) {
  return {
    Input: {
      controlHeight: 40,
      borderRadius: getRadiusPx('md', 8),
      activeBorderColor: activeBorder,
      hoverBorderColor: activeBorder,
      activeBg: t.card,
      hoverBg: t.card,
      activeShadow,
    },
    InputNumber: {
      controlHeight: 40,
      borderRadius: getRadiusPx('md', 8),
      activeBorderColor: activeBorder,
      hoverBorderColor: activeBorder,
      activeBg: t.card,
      hoverBg: t.card,
      activeShadow,
    },
    Select: {
      controlHeight: 40,
      borderRadius: getRadiusPx('md', 8),
      colorPrimary: activeBorder,
    },
    DatePicker: {
      controlHeight: 40,
      borderRadius: getRadiusPx('md', 8),
      activeBorderColor: activeBorder,
      hoverBorderColor: activeBorder,
      activeBg: t.card,
      hoverBg: t.card,
      activeShadow,
    },
  };
}

function buildLayoutTokens(t: ThemeColors) {
  return {
    Button: {
      controlHeight: 40,
      borderRadius: getRadiusPx('button', 8),
      primaryShadow: 'none',
      primaryColor: t.primaryForeground,
      defaultBg: t.card,
      defaultBorderColor: t.border,
      defaultHoverBg: t.surfaceSubtle,
      defaultHoverBorderColor: t.primary,
      contentFontSize: 14,
      fontWeight: 500,
    },
    Table: {
      headerBg: t.muted,
      headerColor: t.foreground,
      headerSortActiveBg: t.surfaceMuted,
      headerSortHoverBg: t.surfaceMuted,
      bodySortBg: t.surfaceSubtle,
      rowHoverBg: t.surfaceMuted,
      rowSelectedBg: t.accent,
      rowSelectedHoverBg: t.accent,
      rowExpandedBg: t.surfaceSubtle,
      borderColor: t.divider,
      cellPaddingBlockSM: 12,
      cellPaddingInlineSM: 12,
      cellFontSizeSM: 14,
      headerBorderRadius: getRadiusPx('sm', 6),
    },
    Layout: {
      bodyBg: t.background,
      headerBg: t.card,
      siderBg: t.card,
    },
    Card: {
      colorBgContainer: t.card,
      headerBg: t.card,
      actionsBg: t.surfaceSubtle,
      extraColor: t.primary,
      borderRadiusLG: getRadiusPx('lg', 8),
      boxShadowTertiary: getShadowValue('card'),
    },
    Modal: {
      contentBg: t.card,
      headerBg: t.card,
      footerBg: t.card,
      titleColor: t.heading,
    },
    Pagination: {
      itemBg: t.card,
      itemLinkBg: t.card,
      itemActiveBg: t.accent,
      itemActiveColor: t.primary,
      itemActiveColorHover: t.primaryHover,
      itemActiveBgDisabled: t.disabled,
      itemActiveColorDisabled: t.disabledForeground,
      itemInputBg: t.card,
    },
    Tabs: {
      itemColor: t.textSubtle,
      itemActiveColor: t.primary,
      itemHoverColor: t.primaryHover,
      itemSelectedColor: t.primary,
    },
    Tag: {
      defaultBg: t.muted,
      defaultColor: t.foreground,
    },
    Menu: {
      itemBg: t.card,
      subMenuItemBg: t.card,
      popupBg: t.card,
      itemSelectedBg: t.accent,
      itemSelectedColor: t.primary,
      itemHoverBg: t.secondary,
      itemHoverColor: t.secondaryForeground,
      itemColor: t.textSubtle,
      activeBarBorderWidth: 0,
      itemBorderRadius: getRadiusPx('sm', 6),
      itemHeight: 42,
      itemMarginInline: 8,
    },
    Timeline: {
      dotBorderWidth: 2,
    },
  };
}

export function AntdConfigProvider({ children }: { readonly children: React.ReactNode }) {
  const { mode } = useThemeStore();
  const t = themeColors[mode];
  const s = { info: t.info, success: t.success, warning: t.warning, error: t.error };
  const activeBorder = t.focus;
  const activeShadow = `0 0 0 3px ${hexToRgba(t.focus, 0.12)}`;

  return (
    <AntdRegistry>
      <ConfigProvider
        locale={enUS}
        modal={{
          centered: true,
          style: { top: 0, paddingBottom: 0 },
          styles: {
            body: {
              maxHeight: 'calc(90svh - 110px)',
              overflowY: 'auto',
            },
          },
        }}
        theme={{
          cssVar: { key: 'cms' },
          token: buildGlobalToken(t, s),
          components: {
            ...buildInputTokens(t, activeBorder, activeShadow),
            ...buildLayoutTokens(t),
          },
        }}
      >
        <App>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  );
}

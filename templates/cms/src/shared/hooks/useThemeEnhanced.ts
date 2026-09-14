'use client';

import type { ThemeMode } from '@/configs/app/design-system';
import { useTheme } from '@/shared/providers';
import { getSystemTheme, getThemeMetadata, isValidTheme, watchSystemTheme } from '@/shared/utils/theme.util';
import { useEffect, useState } from 'react';

export function useThemeEnhanced() {
  const { theme, setTheme, toggleTheme } = useTheme();
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const [isSystemThemeSupported, setIsSystemThemeSupported] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initialSystemTheme = getSystemTheme();
    setSystemTheme(initialSystemTheme);
    setIsSystemThemeSupported(true);

    const unwatch = watchSystemTheme(newSystemTheme => {
      setSystemTheme(newSystemTheme);
    });

    return unwatch;
  }, []);

  const themeMetadata = getThemeMetadata(theme);

  const setValidatedTheme = (newTheme: string) => {
    if (isValidTheme(newTheme)) {
      setTheme(newTheme);
    } else {
      console.warn(`Invalid theme: ${newTheme}`);
    }
  };

  const setSystemThemeMode = () => {
    if (isSystemThemeSupported) {
      setTheme(systemTheme);
    }
  };

  const isMatchingSystem = theme === systemTheme;

  return {
    theme,
    setTheme: setValidatedTheme,
    toggleTheme,

    isDark: themeMetadata.isDark,
    isLight: themeMetadata.isLight,
    colorScheme: themeMetadata.colorScheme,
    primaryColor: themeMetadata.primaryColor,
    backgroundColor: themeMetadata.backgroundColor,
    foregroundColor: themeMetadata.foregroundColor,

    systemTheme,
    isSystemThemeSupported,
    setSystemThemeMode,
    isMatchingSystem,

    isValidTheme,
  };
}

export function useThemeStyles() {
  const { theme, isDark, isLight } = useThemeEnhanced();

  return {
    theme,
    isDark,
    isLight,

    themeClass: `theme-${theme}`,
    colorSchemeClass: isDark ? 'dark' : 'light',

    when: {
      dark: (styles: string) => (isDark ? styles : ''),
      light: (styles: string) => (isLight ? styles : ''),
      theme: (targetTheme: ThemeMode, styles: string) => (theme === targetTheme ? styles : ''),
    },
  };
}

export function useThemeAware<T>(config: { light?: T; dark?: T; claude?: T; modern?: T; fallback: T }) {
  const { theme } = useThemeEnhanced();

  return config[theme] ?? config.fallback;
}

'use client';

import { themeColors, type ThemeMode } from '@/configs/app/design-system';
import { useThemeStore } from '@/shared/stores';
import { createContext, useEffect, type ReactNode } from 'react';

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
  enableTransitions?: boolean;
}

export function ThemeProvider({ children, enableTransitions = true }: ThemeProviderProps) {
  const { mode, setMode, toggle } = useThemeStore();

  useEffect(() => {
    applyTheme(mode, enableTransitions);
  }, [mode, enableTransitions]);

  const contextValue: ThemeContextValue = {
    theme: mode,
    setTheme: setMode,
    toggleTheme: toggle,
  };

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

function applyTheme(theme: ThemeMode, enableTransitions: boolean = true) {
  const root = document.documentElement;
  if (!root) return;

  if (enableTransitions) {
    root.classList.add('theme-transitioning');
  }

  root.classList.remove('theme-light', 'theme-dark', 'theme-modern', 'theme-claude');
  root.classList.add(`theme-${theme}`);

  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  const colors = themeColors[theme];
  Object.entries(colors).forEach(([token, value]) => {
    const cssVar = `--${token.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVar, value);
  });

  if (enableTransitions) {
    setTimeout(() => {
      root.classList.remove('theme-transitioning');
    }, 300);
  }
}

export const THEME_TRANSITION_STYLES = `
  .theme-transitioning,
  .theme-transitioning *,
  .theme-transitioning *:before,
  .theme-transitioning *:after {
    transition: 
      background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      fill 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      stroke 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }

  .theme-transitioning *,
  .theme-transitioning *:before,
  .theme-transitioning *:after {
    transition-property: background-color, border-color, color, fill, stroke, box-shadow !important;
  }
`;

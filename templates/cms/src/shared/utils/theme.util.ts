import { themeColors, type ThemeMode } from '@/configs/app/design-system';

export function getThemeColors(theme: ThemeMode) {
  return themeColors[theme];
}

export function isDarkTheme(theme: ThemeMode): boolean {
  return theme === 'dark';
}

export function isLightTheme(theme: ThemeMode): boolean {
  return theme === 'light' || theme === 'claude' || theme === 'modern';
}

export function getColorScheme(theme: ThemeMode): 'light' | 'dark' {
  return isDarkTheme(theme) ? 'dark' : 'light';
}

export function applyThemeToDocument(
  theme: ThemeMode,
  options: {
    enableTransitions?: boolean;
    transitionDuration?: number;
  } = {},
) {
  const { enableTransitions = true, transitionDuration = 300 } = options;
  const root = document.documentElement;

  if (!root) return;

  if (enableTransitions) {
    root.classList.add('theme-transitioning');
  }

  root.classList.remove('theme-light', 'theme-dark', 'theme-modern', 'theme-claude');
  root.classList.add(`theme-${theme}`);

  if (isDarkTheme(theme)) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  root.style.colorScheme = getColorScheme(theme);

  const colors = getThemeColors(theme);
  Object.entries(colors).forEach(([token, value]) => {
    const cssVar = `--${token.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVar, value);
  });

  if (enableTransitions) {
    setTimeout(() => {
      root.classList.remove('theme-transitioning');
    }, transitionDuration);
  }
}

export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function watchSystemTheme(callback: (theme: 'light' | 'dark') => void) {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light');
  };

  mediaQuery.addEventListener('change', handler);

  return () => {
    mediaQuery.removeEventListener('change', handler);
  };
}

export function getThemeMetadata(theme: ThemeMode) {
  const colors = getThemeColors(theme);

  return {
    theme,
    isDark: isDarkTheme(theme),
    isLight: isLightTheme(theme),
    colorScheme: getColorScheme(theme),
    primaryColor: colors.primary,
    backgroundColor: colors.background,
    foregroundColor: colors.foreground,
  };
}

export function isValidTheme(theme: string): theme is ThemeMode {
  return theme in themeColors;
}

export function getNextTheme(currentTheme: ThemeMode): ThemeMode {
  const toggleMap: Record<ThemeMode, ThemeMode> = {
    light: 'dark',
    dark: 'light',
    modern: 'dark',
    claude: 'dark',
  };

  return toggleMap[currentTheme];
}

import type { ThemeMode } from '@/configs/app/design-system';
import { APP_TEMPLATE_CONFIG } from '@/configs/app/template';
import { applyThemeToDocument, getNextTheme } from '@/shared/utils/theme.util';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

function applyTheme(mode: ThemeMode) {
  applyThemeToDocument(mode, { enableTransitions: true });
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: APP_TEMPLATE_CONFIG.brand.defaultTheme,
      toggle: () => {
        const next = getNextTheme(get().mode);
        applyTheme(next);
        set({ mode: next });
      },
      setMode: (mode: ThemeMode) => {
        applyTheme(mode);
        set({ mode });
      },
    }),
    {
      name: 'theme-preference',
      onRehydrateStorage: () => state => {
        if (state?.mode) {
          applyTheme(state.mode);
        }
      },
    },
  ),
);

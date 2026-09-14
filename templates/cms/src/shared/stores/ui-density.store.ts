import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UiDensity = 'compact' | 'comfortable' | 'spacious';

export const DENSITY_CONTROL_HEIGHT_MAP: Record<UiDensity, string> = {
  compact: '2rem',
  comfortable: '2.25rem',
  spacious: '2.5rem',
};

export function updateControlHeightCssVar(density: UiDensity) {
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--control-height', DENSITY_CONTROL_HEIGHT_MAP[density]);
  }
}

export interface UiDensityStore {
  density: UiDensity;
  setDensity: (density: UiDensity) => void;
}

export const useUiDensityStore = create<UiDensityStore>()(
  persist(
    set => ({
      density: 'comfortable',
      setDensity: (density: UiDensity) => {
        updateControlHeightCssVar(density);
        set({ density });
      },
    }),
    {
      name: 'ui-density-preference',
      onRehydrateStorage: () => state => {
        if (state?.density) {
          updateControlHeightCssVar(state.density);
        }
      },
    },
  ),
);

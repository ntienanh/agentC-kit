import { describe, expect, it } from 'vitest';
import { DENSITY_CONTROL_HEIGHT_MAP, updateControlHeightCssVar, useUiDensityStore } from './ui-density.store';

describe('ui-density.store', () => {
  it('maps density options to correct control height rem values', () => {
    expect(DENSITY_CONTROL_HEIGHT_MAP.compact).toBe('2rem');
    expect(DENSITY_CONTROL_HEIGHT_MAP.comfortable).toBe('2.25rem');
    expect(DENSITY_CONTROL_HEIGHT_MAP.spacious).toBe('2.5rem');
  });

  it('updates density state in store and syncs CSS variable', () => {
    const { setDensity } = useUiDensityStore.getState();
    setDensity('compact');
    expect(useUiDensityStore.getState().density).toBe('compact');

    setDensity('spacious');
    expect(useUiDensityStore.getState().density).toBe('spacious');
  });

  it('handles updateControlHeightCssVar safely in non-DOM environment', () => {
    expect(() => updateControlHeightCssVar('comfortable')).not.toThrow();
  });
});

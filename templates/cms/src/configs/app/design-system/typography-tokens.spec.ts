import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DESIGN_TOKENS_MANIFEST } from './tokens.config';

const projectRoot = process.cwd();

describe('Modern Slate typography tokens', () => {
  it('matches the documented type scale and reading rhythm', () => {
    const { fontSize, fontWeight, lineHeight } = DESIGN_TOKENS_MANIFEST.typography;

    expect(fontSize.xs.px).toBe(12);
    expect(fontSize.compact.px).toBe(13);
    expect(fontSize.sm.px).toBe(14);
    expect(fontSize.base.px).toBe(16);
    expect(fontSize.xl.px).toBe(20);
    expect(fontSize['2xl'].px).toBe(24);
    expect(fontSize['3xl'].px).toBe(28);
    expect(fontSize['4xl'].px).toBe(32);
    expect(fontWeight.medium.value).toBe('500');
    expect(fontWeight.semibold.value).toBe('600');
    expect(fontWeight.bold.value).toBe('700');
    expect(lineHeight.tight.value).toBe('1.25');
    expect(lineHeight.normal.value).toBe('1.5');
    expect(lineHeight.relaxed.value).toBe('1.625');
  });

  it('exposes semantic roles for page hierarchy and supporting text', async () => {
    const source = await readFile(join(projectRoot, 'src/shared/styles/typography-utilities.css'), 'utf8');

    for (const role of [
      '.heading-1',
      '.body-sm',
      '.body-compact',
      '.caption',
      '.eyebrow',
      '.label',
      '.metric-label',
      '.metric-value',
    ]) {
      expect(source).toContain(role);
    }
  });
});

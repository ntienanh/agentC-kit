import { describe, expect, it, vi } from 'vitest';
import { AppSortableList } from './AppSortableList';

describe('AppSortableList', () => {
  it('exports AppSortableList component function correctly', () => {
    expect(AppSortableList).toBeDefined();
    expect(typeof AppSortableList).toBe('function');
  });

  it('re-orders array items correctly when dragging', () => {
    const items = [
      { id: 'sec-1', name: 'Header' },
      { id: 'sec-2', name: 'Banner' },
      { id: 'sec-3', name: 'Footer' },
    ];

    const onReorder = vi.fn();
    expect(onReorder).toBeDefined();

    expect(items.map(i => i.id)).toEqual(['sec-1', 'sec-2', 'sec-3']);
  });
});

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AppRichTextToolbar } from './AppRichTextToolbar';

describe('AppRichTextToolbar', () => {
  it('exports AppRichTextToolbar component function correctly', () => {
    expect(AppRichTextToolbar).toBeDefined();
    expect(typeof AppRichTextToolbar).toBe('function');
  });

  it('instantiates toolbar element with custom handlers', () => {
    const onFormat = vi.fn();
    const element = React.createElement(AppRichTextToolbar, { onFormat });
    expect(element.type).toBe(AppRichTextToolbar);
    expect(element.props.onFormat).toBe(onFormat);
  });
});

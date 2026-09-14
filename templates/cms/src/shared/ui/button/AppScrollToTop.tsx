'use client';

import { FloatButton } from 'antd';

export function AppScrollToTop() {
  return (
    <FloatButton.BackTop
      visibilityHeight={800}
      target={() => document.querySelector('.ant-layout-content') as HTMLElement}
      tooltip='Scroll to top'
      aria-label='Scroll to top'
      type='primary'
      style={{ right: 48, bottom: 48, transition: 'opacity 0.3s ease' }}
    />
  );
}

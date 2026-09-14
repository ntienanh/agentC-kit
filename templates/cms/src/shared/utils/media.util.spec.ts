import { describe, expect, it } from 'vitest';

import { getMediaThumbnailUrl, getMediaUrl } from './media.util';

describe('media util CMS asset bridges', () => {
  it('resolves relative CMS asset urls into absolute urls', () => {
    expect(getMediaUrl({ url: '/uploads/banner.jpg' })).toBe('/uploads/banner.jpg');
  });

  it('prefers thumbnail format before the original asset url', () => {
    expect(
      getMediaThumbnailUrl({
        url: '/uploads/original.jpg',
        formats: {
          thumbnail: { url: '/uploads/thumb.jpg' },
          small: { url: '/uploads/small.jpg' },
        },
      }),
    ).toBe('/uploads/thumb.jpg');
  });

  it('falls back to the original asset when no preview format exists', () => {
    expect(getMediaThumbnailUrl({ url: '/uploads/original.jpg', formats: null })).toBe('/uploads/original.jpg');
  });
});

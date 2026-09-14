import { describe, expect, it } from 'vitest';
import { sanitizeDtoPayload } from './dto.util';

describe('sanitizeDtoPayload', () => {
  it('should strip createdAt and updatedAt from payload object', () => {
    const rawPayload = {
      id: '123',
      name: 'Test Project',
      status: 'ACTIVE',
      createdAt: '2026-07-27T00:00:00Z',
      updatedAt: '2026-07-27T09:00:00Z',
    };

    const sanitized = sanitizeDtoPayload(rawPayload);

    expect(sanitized).toEqual({
      id: '123',
      name: 'Test Project',
      status: 'ACTIVE',
    });
    expect(sanitized).not.toHaveProperty('createdAt');
    expect(sanitized).not.toHaveProperty('updatedAt');
  });

  it('should handle nested object payload sanitization', () => {
    const rawPayload = {
      title: 'Nested Test',
      meta: {
        author: 'Admin',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-02',
      },
      createdAt: '2026-07-27',
    };

    const sanitized = sanitizeDtoPayload(rawPayload);

    expect(sanitized).toEqual({
      title: 'Nested Test',
      meta: {
        author: 'Admin',
      },
    });
  });

  it('should preserve dates and arrays unchanged', () => {
    const now = new Date();
    const rawPayload = {
      tags: ['a', 'b'],
      startDate: now,
      createdAt: '2026-07-27',
    };

    const sanitized = sanitizeDtoPayload(rawPayload);

    expect(sanitized).toEqual({
      tags: ['a', 'b'],
      startDate: now,
    });
  });
});

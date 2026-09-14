export function sanitizeDtoPayload<T extends Record<string, any>>(payload: T): Partial<T> {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return payload;
  }

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (key === 'createdAt' || key === 'updatedAt') {
      continue;
    }

    if (value !== undefined && value !== null) {
      if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        sanitized[key] = sanitizeDtoPayload(value);
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized as Partial<T>;
}

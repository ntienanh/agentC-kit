export function hasAtLeastOneValue(obj: unknown): boolean {
  if (!obj || typeof obj !== 'object') return false;

  return Object.values(obj).some(value => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return hasAtLeastOneValue(value);
    return value !== undefined && value !== null && value !== '';
  });
}

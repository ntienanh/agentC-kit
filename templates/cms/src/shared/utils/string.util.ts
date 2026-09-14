export const formatString = (value: unknown, fallback?: string) => {
  if (value === null || value === undefined) {
    return fallback || '-';
  }

  if (typeof value === 'number') {
    return value.toLocaleString();
  }

  return String(value);
};

export function capitalizeFirstLetter(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

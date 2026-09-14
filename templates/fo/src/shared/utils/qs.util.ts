import qs from 'qs';

export function stringifyQuery(params: Record<string, unknown>, options?: qs.IStringifyOptions): string {
  return qs.stringify(params, {
    arrayFormat: 'indices',
    encode: false,
    ...options,
  });
}

export function parseQuery<T = Record<string, unknown>>(queryString: string, options?: qs.IParseOptions): T {
  const cleanQuery = queryString.startsWith('?') ? queryString.slice(1) : queryString;
  return qs.parse(cleanQuery, options) as T;
}

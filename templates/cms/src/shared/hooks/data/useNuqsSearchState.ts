'use client';

import { parseAsString, useQueryState } from 'nuqs';

export function useNuqsSearchState(key = 'search', defaultValue = '') {
  return useQueryState(
    key,
    parseAsString.withDefault(defaultValue).withOptions({
      shallow: true,
      throttleMs: 300,
      clearOnDefault: true,
    }),
  );
}

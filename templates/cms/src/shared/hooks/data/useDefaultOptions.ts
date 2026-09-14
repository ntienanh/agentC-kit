'use client';

import { useEffect, useState } from 'react';

interface OptionLike {
  value: string | number;
}

export function useDefaultOptions<T>({
  value,
  defaultValuesFetcher,
  mapOption,
}: {
  value: string | number | Array<string | number> | null | undefined;
  defaultValuesFetcher?: (ids: Array<string | number>) => Promise<T[]>;
  mapOption: (row: T) => OptionLike;
}) {
  const [initialOptions, setInitialOptions] = useState<OptionLike[]>([]);

  useEffect(() => {
    if (value && defaultValuesFetcher) {
      const ids = Array.isArray(value) ? value : [value];

      defaultValuesFetcher(ids)
        .then(res => setInitialOptions(res.map(mapOption)))
        .catch(() => setInitialOptions([]));
    }
  }, [value, defaultValuesFetcher, mapOption]);

  return { initialOptions };
}

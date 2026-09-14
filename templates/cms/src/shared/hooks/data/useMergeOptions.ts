import { useMemo } from 'react';

interface OptionLike {
  value: string | number;
}

export function useMergeOptions<T extends OptionLike>(initial: T[], options: T[]) {
  return useMemo(() => {
    const all = [...initial, ...(options ?? [])];
    return all.filter((v, i, self) => i === self.findIndex(o => o.value === v.value));
  }, [initial, options]);
}

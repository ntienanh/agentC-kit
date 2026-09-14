import type { ReactNode } from 'react';

export interface QuerySelectOption<T> {
  label: string;
  value: string;
  raw?: T;
}

export interface QuerySelectQueryFnParams {
  search?: string;
  page: number;
  limit: number;
}

export interface QuerySelectQueryResponse<T> {
  data: T[];
  paging?: {
    nextPage?: number | null;
  };
}

export interface QuerySelectProps<T> {
  queryConfig: {
    queryKey: readonly unknown[];
    queryFn: (params: QuerySelectQueryFnParams) => Promise<QuerySelectQueryResponse<T>>;
  };

  mapOption: (item: T) => QuerySelectOption<T>;

  multiple?: boolean;
  placeholder?: ReactNode;
  value?: string | string[];
  onChange?: (value: string | string[]) => void;

  defaultValuesFetcher?: (id: string) => Promise<QuerySelectOption<T> | null>;
}

export type ApiError = {
  code: string | number;
  message: string;
  details?: unknown;
};

export interface ApiResponse<T> {
  data: T | null;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
  };
  error?: {
    code: string | number;
    message: string;
    details?: unknown;
  };
}

export type FilterOperator =
  | { eq: string | number | boolean }
  | { ne: string | number | boolean }
  | { lt: number }
  | { lte: number }
  | { gt: number }
  | { gte: number }
  | { in: (string | number)[] }
  | { nin: (string | number)[] }
  | { contains: string }
  | { bt: [string, string] };

export type FilterValue = string | number | boolean | FilterOperator | Record<string, unknown> | null;
export type FilterGroup = Record<string, unknown>;

export interface QueryParams {
  page?: number;
  pageSize?: number;
  limit?: number;
  sort?: string | string[];
  orderBy?: string;
  orderType?: 'asc' | 'desc';
  search?: string;
  filters?: FilterGroup;
  populate?: string | string[];
  [key: string]: unknown;
}

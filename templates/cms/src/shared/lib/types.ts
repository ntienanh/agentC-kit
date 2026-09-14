export type {
  ApiError as CmsError,
  QueryParams as CmsQuery,
  ApiResponse as CmsResponse,
} from '@/shared/lib/http/types';

export interface Entity {
  id: string;
  documentId?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: string | null;
  deletedBy?: string;
  publishedAt?: string;
}

export type OrderType = 'asc' | 'desc';

export interface IOrder {
  orderBy?: string;
  orderType?: OrderType;
}

export interface IPaging {
  page?: number;
  limit?: number;
}

export interface IList {
  search?: string;
  filters?: {
    [field: string]: {
      [operator: string]: unknown;
    };
  };
  page?: number;
  limit?: number;
  orderBy?: string;
  orderType?: OrderType;
}

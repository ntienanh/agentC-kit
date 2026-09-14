export interface ApiMessageResponse {
  message: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

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

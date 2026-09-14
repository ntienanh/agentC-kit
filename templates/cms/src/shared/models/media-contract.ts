export interface MediaMetadata {
  altText?: string;
  caption?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  originalName?: string;
  storageProvider?: string;
  storageKey?: string;
}

export interface MediaItem {
  id: string;
  tenantId: string;
  collectionId?: string | null;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  thumbnailUrl?: string | null;
  metadata?: MediaMetadata | null;
  createdAt: string;
  updatedAt: string;
}

export interface MediaCollection {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  mediaCount: number;
  createdAt: string;
  updatedAt: string;
}

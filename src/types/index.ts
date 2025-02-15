export interface CloudinaryImage {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  metadata: {
    sizeInMm?: string;
    catalogNumber?: string;
    title?: string;
    band?: string;
    badgeTitle?: string;
  };
  context?: {
    custom?: {
      size_mm?: string;
      catalog_number?: string;
      band?: string;
      badge_title?: string;
      details?: string;
    };
  };
}

export interface ImageType {
  id: string;
  url: string;
  title: string;
  description?: string;
  width: number;
  height: number;
  metadata?: {
    sizeInMm?: string;
    catalogNumber?: string;
    band?: string;
    title?: string;
    details?: string;
  };
}

export interface GalleryContextType {
  images: ImageType[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
} 
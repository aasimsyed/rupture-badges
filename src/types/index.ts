export interface ImageType {
  id: string;
  url: string;
  title: string;
  description?: string;
  width: number;
  height: number;
}

export interface GalleryContextType {
  images: ImageType[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
} 
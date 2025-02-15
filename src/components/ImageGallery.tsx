import { useEffect, useRef, useState } from 'react';
import { ImageType } from '@/types';
import ImageCard from './ImageCard';
import Modal from './Modal';
import ImageDetail from './ImageDetail';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { getImages } from '@/utils/cloudinary';

export default function ImageGallery() {
  const [images, setImages] = useState<ImageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersectionObserver(loadMoreRef);

  const loadImages = async (page: number) => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getImages(page);
      
      setImages(prev => {
        const newImages = result.images.map(img => ({
          id: img.public_id,
          url: img.secure_url,
          title: img.public_id.split('/').pop() || '',
          width: img.width,
          height: img.height,
          metadata: img.metadata
        }));
        
        // Combine with previous images
        return page === 1 ? newImages : [...prev, ...newImages];
      });

      setHasMore(result.nextPage !== null);
      setCurrentPage(page);
    } catch (error) {
      setError('Failed to load images');
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadImages(1);
  }, []);

  // Load more when scrolling
  useEffect(() => {
    if (isIntersecting && hasMore) {
      loadImages(currentPage + 1);
    }
  }, [isIntersecting]);

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="text-center text-red-500">{error}</div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            onClick={() => {
              setSelectedImage(image);
              setSelectedIndex(images.findIndex(img => img.id === image.id));
            }}
          />
        ))}
      </div>

      {/* Loading indicator and intersection observer target */}
      <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
        {loading && (
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-punk-pink border-t-transparent" />
        )}
      </div>

      {selectedImage && (
        <Modal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
        >
          <ImageDetail
            image={selectedImage}
            images={images}
            currentIndex={selectedIndex}
            onNavigate={(index) => {
              setSelectedIndex(index);
              setSelectedImage(images[index]);
            }}
          />
        </Modal>
      )}
    </div>
  );
} 
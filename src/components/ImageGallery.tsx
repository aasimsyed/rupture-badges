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
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersectionObserver(loadMoreRef);

  const loadImages = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getImages(nextCursor);
      
      if (result.images.length === 0 && images.length === 0) {
        setError('No images found');
        setHasMore(false);
        return;
      }
      
      setImages(prev => {
        const newImages = result.images.map(img => ({
          id: img.public_id,
          url: img.secure_url,
          title: img.public_id.split('/').pop() || '',
          width: img.width,
          height: img.height,
        }));
        
        // Filter out duplicates based on id
        const existingIds = new Set(prev.map(img => img.id));
        const uniqueNewImages = newImages.filter(img => !existingIds.has(img.id));
        
        return [...prev, ...uniqueNewImages];
      });
      
      setNextCursor(result.nextCursor);
      setHasMore(!!result.nextCursor);
    } catch (error) {
      console.error('Failed to load images:', error);
      setError('Failed to load images. Please try again.');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadImages();
  }, []);

  // Load more when scrolling
  useEffect(() => {
    if (isIntersecting) {
      loadImages();
    }
  }, [isIntersecting]);

  return (
    <div className="space-y-8">
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

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="h-10">
        {loading && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-punk-pink border-t-transparent" />
          </div>
        )}
      </div>

      {/* Modal */}
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
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
    if (isIntersecting && !loading && hasMore) {
      loadImages();
    }
  }, [isIntersecting]);

  const handleImageClick = (image: ImageType) => {
    const index = images.findIndex(img => img.id === image.id);
    setSelectedIndex(index);
    setSelectedImage(image);
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="text-red-600 text-center p-4 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            onClick={() => handleImageClick(image)}
          />
        ))}
      </div>

      {/* Loading indicator and intersection observer target */}
      <div
        ref={loadMoreRef}
        className="h-20 w-full flex justify-center items-center"
      >
        {loading && (
          <div className="animate-pulse flex space-x-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
          </div>
        )}
        {!loading && hasMore && images.length > 0 && (
          <div className="text-gray-500">Scroll for more</div>
        )}
        {!hasMore && images.length > 0 && (
          <div className="text-gray-500">No more images to load</div>
        )}
      </div>

      {selectedImage && (
        <Modal isOpen={!!selectedImage} onClose={() => setSelectedImage(null)}>
          <ImageDetail
            image={selectedImage}
            images={images}
            currentIndex={selectedIndex}
            onNavigate={(newIndex) => {
              setSelectedIndex(newIndex);
              setSelectedImage(images[newIndex]);
            }}
          />
        </Modal>
      )}
    </div>
  );
} 
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
  
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersectionObserver(loadMoreRef, {
    threshold: 0.5,
    rootMargin: '100px',
  });

  const loadImages = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const result = await getImages(nextCursor);
      
      setImages(prev => [
        ...prev,
        ...result.images.map(img => ({
          id: img.public_id,
          url: img.secure_url,
          title: img.public_id.split('/').pop() || '',
          width: img.width,
          height: img.height,
        })),
      ]);
      
      setNextCursor(result.nextCursor);
      setHasMore(!!result.nextCursor);
    } catch (error) {
      console.error('Failed to load images:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isIntersecting) {
      loadImages();
    }
  }, [isIntersecting]);

  const handleImageClick = (image: ImageType) => {
    const index = images.findIndex(img => img.id === image.id);
    setSelectedIndex(index);
    setSelectedImage(image);
  };

  return (
    <>
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              onClick={() => handleImageClick(image)}
            />
          ))}
        </div>
        
        <div
          ref={loadMoreRef}
          className="col-span-full flex justify-center p-4"
        >
          {loading && (
            <div className="inline-flex items-center px-4 py-2 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-pink-600 hover:bg-pink-500 focus:outline-none focus:border-pink-700 focus:shadow-outline-pink active:bg-pink-700 transition ease-in-out duration-150 cursor-not-allowed">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={!!selectedImage}
        onClose={() => {
          setSelectedImage(null);
          setSelectedIndex(0);
        }}
      >
        {selectedImage && (
          <ImageDetail
            image={selectedImage}
            images={images}
            currentIndex={selectedIndex}
            onNavigate={(index) => {
              setSelectedIndex(index);
              setSelectedImage(images[index]);
            }}
          />
        )}
      </Modal>
    </>
  );
} 
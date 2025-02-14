import Image from 'next/image';
import { useState, useCallback, useEffect, useRef } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ImageType } from '@/types';
import { 
  ArrowLeftCircleIcon, 
  ArrowRightCircleIcon,
  MagnifyingGlassIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon
} from '@heroicons/react/24/outline';
import useSwipeGesture from '@/hooks/useSwipeGesture';

interface ImageDetailProps {
  image: ImageType;
  images: ImageType[];
  onNavigate: (index: number) => void;
  currentIndex: number;
}

export default function ImageDetail({ image, images, onNavigate, currentIndex }: ImageDetailProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePrevious = useCallback(() => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    onNavigate(newIndex);
  }, [currentIndex, images.length, onNavigate]);

  const handleNext = useCallback(() => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    onNavigate(newIndex);
  }, [currentIndex, images.length, onNavigate]);

  const { isSwiping } = useSwipeGesture({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrevious,
    threshold: 75,
  });

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen API error:', error);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`p-6 relative ${
        isFullscreen ? 'bg-punk-black fixed inset-0 z-50' : ''
      }`}
    >
      {/* Navigation Arrows */}
      <button
        onClick={handlePrevious}
        title="Previous image"
        className={`absolute left-8 top-1/2 -translate-y-1/2 z-20 text-white/70 hover:text-white transition-colors ${
          isSwiping ? 'opacity-0' : 'opacity-100'
        }`}
        aria-label="Previous image"
      >
        <ArrowLeftCircleIcon className="h-10 w-10" />
      </button>
      
      <button
        onClick={handleNext}
        title="Next image"
        className="absolute right-8 top-1/2 -translate-y-1/2 z-20 text-white/70 hover:text-white transition-colors"
        aria-label="Next image"
      >
        <ArrowRightCircleIcon className="h-10 w-10" />
      </button>

      {/* Image with Zoom */}
      <div className={`relative aspect-square w-full overflow-hidden rounded-lg bg-punk-black ${
        isFullscreen ? 'h-screen max-h-none' : 'max-h-[70vh]'
      }`}>
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={4}
          onTransformed={(_, state) => setIsZoomed(state.scale !== 1)}
          centerOnInit
          limitToBounds
          disabled={isSwiping}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <TransformComponent 
                wrapperClass={`w-full h-full ${isFullscreen ? 'h-screen' : ''}`}
              >
                <Image
                  src={image.url}
                  alt={image.title}
                  layout="fill"
                  objectFit="contain"
                  priority
                  sizes={isFullscreen ? '100vw' : '(max-width: 1280px) 100vw, 1280px'}
                />
              </TransformComponent>

              {/* Controls */}
              <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                <button
                  onClick={() => zoomIn()}
                  title="Zoom in"
                  className="p-2 bg-punk-black/80 rounded-full text-white/70 hover:text-white transition-colors"
                  aria-label="Zoom in"
                >
                  <ArrowsPointingOutIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => zoomOut()}
                  title="Zoom out"
                  className="p-2 bg-punk-black/80 rounded-full text-white/70 hover:text-white transition-colors"
                  aria-label="Zoom out"
                >
                  <ArrowsPointingInIcon className="h-5 w-5" />
                </button>
                {isZoomed && (
                  <button
                    onClick={() => resetTransform()}
                    title="Reset zoom"
                    className="p-2 bg-punk-black/80 rounded-full text-white/70 hover:text-white transition-colors"
                    aria-label="Reset zoom"
                  >
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </button>
                )}
                
                <button
                  onClick={toggleFullscreen}
                  title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  className="p-2 bg-punk-black/80 rounded-full text-white/70 hover:text-white transition-colors"
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                >
                  {isFullscreen ? (
                    <ArrowsPointingInIcon className="h-5 w-5" />
                  ) : (
                    <ArrowsPointingOutIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </>
          )}
        </TransformWrapper>
      </div>

      {/* Image Info - Only show in non-fullscreen mode */}
      {!isFullscreen && (
        <div className="mt-6 text-white">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-punk font-bold text-punk-yellow">
              {image.title}
            </h2>
            <div className="text-sm text-punk-pink">
              {currentIndex + 1} / {images.length}
            </div>
          </div>

          {image.description && (
            <p className="mt-2 text-gray-300">{image.description}</p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm border-t border-white/10 pt-4">
            <div>
              <span className="text-punk-pink">Dimensions:</span>
              <span className="ml-2 text-gray-300">
                {image.width} x {image.height}
              </span>
            </div>
            <div>
              <span className="text-punk-pink">ID:</span>
              <span className="ml-2 text-gray-300">{image.id}</span>
            </div>
          </div>

          {/* Thumbnail Navigation */}
          <div className="mt-6 border-t border-white/10 pt-4">
            <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
              {images.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => onNavigate(index)}
                  title={`View ${img.title}`}
                  className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden snap-start ${
                    index === currentIndex ? 'ring-2 ring-punk-pink' : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.title}
                    layout="fill"
                    objectFit="cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
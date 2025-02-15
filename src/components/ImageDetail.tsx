import Image from 'next/image';
import { useState, useCallback, useEffect, useRef } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { ImageType } from '@/types';
import { 
  ArrowLeftCircleIcon, 
  ArrowRightCircleIcon,
  MagnifyingGlassIcon,
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
  console.log('ImageDetail rendered with image:', image);
  console.log('Image metadata:', image.metadata);
  
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

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
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="relative p-4" ref={containerRef}>
        <div className="relative aspect-square overflow-hidden rounded-lg bg-black">
          <TransformWrapper
            ref={transformRef}
            initialScale={1}
            minScale={1}
            maxScale={3}
            onTransformed={(_, state) => setIsZoomed(state.scale > 1)}
          >
            {({ zoomIn, zoomOut, instance }) => (
              <>
                <TransformComponent>
                  <Image
                    src={image.url}
                    alt={image.title}
                    width={image.width}
                    height={image.height}
                    className="object-contain"
                    priority
                  />
                </TransformComponent>

                <button
                  type="button"
                  onClick={() => {
                    const currentScale = instance.transformState.scale;
                    if (currentScale === 1) {
                      zoomIn(2);
                    } else {
                      zoomOut(1);
                    }
                  }}
                  className="absolute top-4 right-4 p-2 text-white bg-black/50 rounded-full hover:bg-black/75 transition-colors"
                  title={isZoomed ? "Zoom Out" : "Zoom In"}
                >
                  {isZoomed ? (
                    <ArrowsPointingInIcon className="h-6 w-6" />
                  ) : (
                    <MagnifyingGlassIcon className="h-6 w-6" />
                  )}
                </button>
              </>
            )}
          </TransformWrapper>
        </div>

        {/* Navigation buttons */}
        <div className="absolute inset-y-0 -left-12 flex items-center">
          {currentIndex > 0 && (
            <button
              type="button"
              title="Previous"
              onClick={handlePrevious}
              className="p-2 text-white bg-black/50 rounded-full hover:bg-black/75"
            >
              <ArrowLeftCircleIcon className="h-8 w-8" />
            </button>
          )}
        </div>
        <div className="absolute inset-y-0 -right-12 flex items-center">
          {currentIndex < images.length - 1 && (
            <button
              type="button"
              title="Next"
              onClick={handleNext}
              className="p-2 text-white bg-black/50 rounded-full hover:bg-black/75"
            >
              <ArrowRightCircleIcon className="h-8 w-8" />
            </button>
          )}
        </div>
      </div>

      {/* Metadata Section */}
      <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          {image.metadata?.catalogNumber && (
            <>
              <dt className="font-semibold text-gray-600">Catalog Number</dt>
              <dd>{image.metadata.catalogNumber}</dd>
            </>
          )}
          {image.metadata?.sizeInMm && (
            <>
              <dt className="font-semibold text-gray-600">Size</dt>
              <dd>{image.metadata.sizeInMm} mm</dd>
            </>
          )}
          {image.metadata?.title && (
            <>
              <dt className="font-semibold text-gray-600">Title</dt>
              <dd className="capitalize">{image.metadata.title}</dd>
            </>
          )}
          {image.metadata?.band && (
            <>
              <dt className="font-semibold text-gray-600">Band</dt>
              <dd>{image.metadata.band}</dd>
            </>
          )}
        </dl>
      </div>
    </div>
  );
}
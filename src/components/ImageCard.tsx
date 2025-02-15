import Image from 'next/image';
import { ImageType } from '@/types';
import { useState } from 'react';

interface ImageCardProps {
  image: ImageType;
  onClick: () => void;
}

export default function ImageCard({ image, onClick }: ImageCardProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div 
      onClick={onClick}
      className="relative group cursor-pointer overflow-hidden bg-black rounded-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
    >
      <div className="aspect-square relative">
        <Image
          src={image.url}
          alt={image.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`
            object-cover transition-opacity duration-300
            ${isLoading ? 'opacity-0' : 'opacity-100'}
          `}
          onLoad={() => setIsLoading(false)}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-gray-900 animate-pulse" />
        )}
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="text-white font-bold text-lg font-punk">{image.metadata?.band && (
          <span className="text-gray-200 text-sm">{image.metadata.band}</span>
        )}</h3>
      </div>
    </div>
  );
} 
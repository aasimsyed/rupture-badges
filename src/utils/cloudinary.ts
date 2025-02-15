import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryImage } from '@/types';  // Import from types instead

// Only configure cloudinary on the server side
if (typeof window === 'undefined') {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function getImages(page?: number): Promise<{
  images: CloudinaryImage[];
  nextPage: number | null;
  total: number;
}> {
  try {
    const params = new URLSearchParams();
    if (page) {
      params.append('page', page.toString());
    }
    
    const timestamp = Date.now();
    params.append('_t', timestamp.toString());
    
    const response = await fetch(`/api/images?${params.toString()}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', response.status, errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.images) {
      throw new Error('Invalid response format');
    }
    
    return {
      images: data.images,
      nextPage: data.nextPage,
      total: data.total
    };
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  }
}

export function buildImageUrl(publicId: string, transforms: string = ''): string {
  // Use a simple URL construction for client-side
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  return transforms 
    ? `${baseUrl}/${transforms}/${publicId}`
    : `${baseUrl}/${publicId}`;
}

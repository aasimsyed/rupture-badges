import { v2 as cloudinary } from 'cloudinary';

// Only configure cloudinary on the server side
if (typeof window === 'undefined') {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export interface CloudinaryImage {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
}

export async function getImages(nextCursor?: string): Promise<{
  images: CloudinaryImage[];
  nextCursor?: string;
}> {
  try {
    const params = new URLSearchParams();
    if (nextCursor) {
      params.append('cursor', nextCursor);
    }
    
    // Add timestamp to prevent caching
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
      nextCursor: data.nextCursor,
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

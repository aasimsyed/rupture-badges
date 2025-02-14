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
    
    // Always use the API route instead of direct Cloudinary SDK calls on the client
    const response = await fetch(`/api/images?${params}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch images');
    }
    
    return {
      images: data.images,
      nextCursor: data.nextCursor,
    };
  } catch (error) {
    console.error('Error fetching images:', error);
    return { images: [] };
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

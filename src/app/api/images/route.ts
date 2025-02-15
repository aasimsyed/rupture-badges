import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import { getMetadataForImage } from '@/utils/metadata';
import { CloudinaryImage } from '@/types';

// Remove edge runtime and keep dynamic
export const dynamic = 'force-dynamic';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function GET(request: NextRequest) {
  try {
    if (!process.env.CLOUDINARY_FOLDER) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = 12;

    // Load all images at once and cache them in memory (this will be done once)
    if (!global.sortedImages) {
      const results = await cloudinary.search
        .expression(`resource_type:image AND folder=${process.env.CLOUDINARY_FOLDER}`)
        .with_field('tags')
        .with_field('context')
        .with_field('metadata')
        .max_results(2000)
        .execute();

      // Process and sort all images
      global.sortedImages = results.resources
        .map((img: CloudinaryImage) => {
          const metadata = getMetadataForImage(img.public_id);
          return {
            public_id: img.public_id,
            secure_url: img.secure_url,
            width: img.width,
            height: img.height,
            metadata: {
              sizeInMm: metadata?.sizeInMm,
              catalogNumber: metadata?.catalogNumber,
              title: metadata?.title,
              ...(metadata?.bandName && { band: metadata.bandName }),
            }
          };
        })
        .sort((a: CloudinaryImage, b: CloudinaryImage) => {
          const aMatch = a.metadata.catalogNumber?.match(/B(\d+)/);
          const bMatch = b.metadata.catalogNumber?.match(/B(\d+)/);
          const aNum = aMatch ? parseInt(aMatch[1], 10) : 9999;
          const bNum = bMatch ? parseInt(bMatch[1], 10) : 9999;
          return aNum - bNum;
        });
    }

    // Paginate the sorted results
    const startIndex = (page - 1) * pageSize;
    const paginatedImages = global.sortedImages.slice(startIndex, startIndex + pageSize);
    const hasMore = startIndex + pageSize < global.sortedImages.length;

    return NextResponse.json({
      images: paginatedImages,
      nextPage: hasMore ? page + 1 : null,
      total: global.sortedImages.length
    });
  } catch (error) {
    console.error('Error in /api/images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}

// Add type declaration for global
declare global {
  var sortedImages: CloudinaryImage[];
}
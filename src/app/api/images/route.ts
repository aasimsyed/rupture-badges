import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cursor = searchParams.get('cursor');
  
  try {
    console.log('Fetching images from folder:', process.env.CLOUDINARY_FOLDER);
    const results = await cloudinary.search
      .expression(`resource_type:image AND folder=${process.env.CLOUDINARY_FOLDER}`)
      .with_field('tags')
      .with_field('context')
      .sort_by('created_at', 'desc')
      .max_results(12)
      .next_cursor(cursor || undefined)
      .execute();

    console.log('Found images:', results.resources.length);
    
    return NextResponse.json({
      images: results.resources,
      nextCursor: results.next_cursor,
    });
  } catch (error) {
    console.error('Error in /api/images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images', details: error },
      { status: 500 }
    );
  }
}
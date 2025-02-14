import Layout from '@/components/Layout';
import ImageGallery from '@/components/ImageGallery';

export default function Home() {
  return (
    <Layout title="Punk Rock Badge Gallery">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-pink-600 font-punk tracking-wider uppercase">
            Badge Collection
          </h2>
          <p className="mt-2 text-gray-600">
            Scroll through our collection of vintage punk rock badges
          </p>
        </div>
        
        <ImageGallery />
      </div>
    </Layout>
  );
} 
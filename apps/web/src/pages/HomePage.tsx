import { Helmet } from 'react-helmet-async';
import HeroBanner from '@/components/home/HeroBanner';
import FeaturesSection from '@/components/home/FeaturesSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import PromotionsSection from '@/components/home/PromotionsSection';
import FlashsaleProducts from '@/components/catalog/FlashsaleProducts';
import HomeSchema from '@/components/home/HomeSchema';

/**
 * HomePage renders the new modern homepage design
 * Includes SEO metadata and structured data
 */
export default function HomePage() {
  return (
    <>
      {/* SEO metadata */}
      <Helmet>
        <title>MM Vietnam - Siêu thị trực tuyến hàng chính hãng</title>
        <meta name="description" content="Siêu thị trực tuyến MM Vietnam với hàng nghìn sản phẩm chất lượng, giao hàng nhanh chóng, giá cả cạnh tranh. Mua sắm online an toàn, tiện lợi." />
        <meta name="keywords" content="mua sắm online, siêu thị trực tuyến, hàng chính hãng, giao hàng nhanh" />
      </Helmet>

      {/* Structured data */}
      <HomeSchema />

      {/* Modern homepage design */}
      <HeroBanner />
      <FeaturesSection />
      <CategoriesSection />
      <PromotionsSection />

      {/* Flash Sale Products */}
      <div className="bg-gray-50 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <FlashsaleProducts pageSize={12} />
        </div>
      </div>
    </>
  );
}


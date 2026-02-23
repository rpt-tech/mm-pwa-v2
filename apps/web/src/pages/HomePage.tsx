import CmsPage from '@/components/cms/CmsPage';
import HeroBanner from '@/components/home/HeroBanner';
import FeaturesSection from '@/components/home/FeaturesSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import PromotionsSection from '@/components/home/PromotionsSection';
import FlashsaleProducts from '@/components/catalog/FlashsaleProducts';

/**
 * HomePage renders the new modern homepage design
 * CmsPage injects SEO metadata and any CMS-managed content blocks
 */
export default function HomePage() {
  return (
    <>
      {/* CmsPage injects SEO <Helmet> tags and HomeSchema JSON-LD */}
      <CmsPage identifier="home" fallbackElement={null} />

      {/* New modern homepage design */}
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


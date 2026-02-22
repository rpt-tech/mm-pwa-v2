import CmsPage from '@/components/cms/CmsPage';
import HomeLandingFallback from '@/components/home/HomeLandingFallback';

/**
 * HomePage renders the visual landing content (HomeLandingFallback) always,
 * plus CmsPage for SEO metadata and any CMS-managed content blocks.
 * The Magento "home" CMS page only contains SEO JSON-LD structured data —
 * the actual visual homepage content lives in HomeLandingFallback.
 */
export default function HomePage() {
  return (
    <>
      {/* CmsPage injects SEO <Helmet> tags and HomeSchema JSON-LD */}
      <CmsPage identifier="home" fallbackElement={null} />
      {/* Always render the visual homepage content */}
      <HomeLandingFallback />
    </>
  );
}


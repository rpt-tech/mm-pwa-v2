import CmsPage from '@/components/cms/CmsPage';
import HomeLandingFallback from '@/components/home/HomeLandingFallback';

export default function HomePage() {
  return <CmsPage identifier="home" fallbackElement={<HomeLandingFallback />} />;
}

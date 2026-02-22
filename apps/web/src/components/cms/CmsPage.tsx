import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { gqlClient } from '@/lib/graphql-client';
import { GET_CMS_PAGE, GET_URL_RESOLVER } from '@/queries/cms';
import RichContent from '@/components/cms/RichContent';
import { useParams, useNavigate } from 'react-router-dom';
import HomeSchema from '@/components/home/HomeSchema';
import SearchPopular from '@/components/navbar/SearchPopular';
import ContentTypeFactory from '@/components/cms/contentTypes/ContentTypeFactory';
import NotFoundPage from '@/pages/NotFoundPage';
import { parsePageBuilderHtml } from '@/lib/pagebuilderParser';

interface CmsPageData {
  cmsPage: {
    identifier: string;
    url_key: string;
    title: string;
    content: string;
    content_heading: string;
    page_layout: string;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
  };
}

/**
 * CMS Page component
 * Renders CMS pages with PageBuilder content
 */
export const CmsPage: React.FC<{ identifier?: string; fallbackElement?: React.ReactNode }> = ({ identifier: propIdentifier, fallbackElement }) => {
  const params = useParams();
  const navigate = useNavigate();
  const rawIdentifier = propIdentifier || params['urlKey'] || params['*'] || 'home';
  // Strip .html suffix for CMS lookup
  const identifier = rawIdentifier.replace(/\.html$/, '');
  const isHome = identifier === 'home';

  const { data, isLoading, error } = useQuery<CmsPageData>({
    queryKey: ['cmsPage', identifier],
    queryFn: async () => {
      return gqlClient.request(GET_CMS_PAGE, { identifier });
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // URL resolver — runs when CMS page not found, to check if it's a category/product
  const { data: resolverData, isLoading: resolverLoading } = useQuery({
    queryKey: ['urlResolver', rawIdentifier],
    queryFn: async () => {
      return gqlClient.request(GET_URL_RESOLVER, { url: rawIdentifier });
    },
    enabled: !isLoading && (!!error || !data?.cmsPage) && !isHome,
    staleTime: 5 * 60 * 1000,
  });

  // Redirect based on URL resolver result
  React.useEffect(() => {
    if (!resolverData?.urlResolver) return;
    const { type, relative_url, url_path, url_key } = resolverData.urlResolver;
    if (type === 'CATEGORY') {
      // url_path from Magento already includes "category/" prefix — strip it
      const rawPath = url_path || url_key || relative_url || '';
      const categoryPath = rawPath.replace(/^category\//, '');
      navigate(`/category/${categoryPath}`, { replace: true });
    } else if (type === 'PRODUCT') {
      const productKey = url_key || relative_url;
      navigate(`/product/${productKey}`, { replace: true });
    }
  }, [resolverData, navigate]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error || !data?.cmsPage) {
    if (fallbackElement) {
      return <>{fallbackElement}</>;
    }

    if (isHome) {
      return <HomeSchema />; // ensure schema even if home data missing
    }

    // Wait for URL resolver to finish — it may redirect to category/product
    if (resolverLoading) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      );
    }

    // URL resolver returned nothing — genuine 404
    return <NotFoundPage />;
  }

  const { content_heading, title, meta_title, content } = data.cmsPage;
  const pageTitle = meta_title || title;

  // Try to parse as PageBuilder HTML → structured component tree
  // Falls back to raw HTML rendering via RichContent
  let blocks: any[] = [];
  let isStructuredContent = false;
  if (content) {
    // First try JSON (custom structured format)
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        blocks = parsed;
        isStructuredContent = true;
      }
    } catch {
      // Standard Magento PageBuilder HTML — parse data-content-type tree
      const parsed = parsePageBuilderHtml(content);
      if (parsed && parsed.length > 0) {
        blocks = parsed;
        isStructuredContent = true;
      }
    }
  }

  return (
    <article className="cms-page">
      {isHome && <HomeSchema />}
      <Helmet>
        <title>{pageTitle || 'MM Vietnam'}</title>
        {data.cmsPage.meta_description && <meta name="description" content={data.cmsPage.meta_description} />}
        {data.cmsPage.meta_keywords && <meta name="keywords" content={data.cmsPage.meta_keywords} />}
      </Helmet>
      {pageHeading(content_heading, pageTitle)}
      <div className="space-y-6 max-w-6xl mx-auto px-4 py-6">
        {isStructuredContent
          ? blocks.map((block: any, index: number) => (
              <ContentTypeFactory key={block.content_type + index} data={block} />
            ))
          : <RichContent html={content} />
        }
        {isHome && <SearchPopular />}
      </div>
    </article>
  );
};

const pageHeading = (heading: string, title: string) => {
  if (!heading) return null;
  return (
    <div className="pt-6">
      <p className="text-xs uppercase tracking-[0.4em] text-gray-500 text-center">{heading}</p>
      <h1 className="text-4xl font-bold text-center mt-4">{title}</h1>
    </div>
  );
};

export default CmsPage;

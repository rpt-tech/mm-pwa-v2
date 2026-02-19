import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { gqlClient } from '@/lib/graphql-client';
import { GET_CMS_PAGE } from '@/queries/cms';
import RichContent from '@/components/cms/RichContent';
import { useParams } from 'react-router-dom';

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
  const identifier = propIdentifier || params['*'] || 'home';

  const { data, isLoading, error } = useQuery<CmsPageData>({
    queryKey: ['cmsPage', identifier],
    queryFn: async () => {
      return gqlClient.request(GET_CMS_PAGE, { identifier });
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

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

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-600">Page Not Found</h1>
        <p className="mt-4">The page you are looking for does not exist.</p>
      </div>
    );
  }

  const { content_heading, title, meta_title, content } = data.cmsPage;
  const pageTitle = meta_title || title;

  return (
    <article className="cms-page">
      {/* Set page title */}
      {pageTitle && (
        <title>{pageTitle}</title>
      )}

      {content_heading && (
        <h1 className="text-3xl font-bold mb-6 container mx-auto px-4 pt-8">
          {content_heading}
        </h1>
      )}

      <RichContent html={content} />
    </article>
  );
};

export default CmsPage;

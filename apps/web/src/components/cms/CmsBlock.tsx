import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { gqlClient } from '@/lib/graphql-client';
import { GET_CMS_BLOCKS } from '@/queries/cms';
import RichContent from './RichContent';

interface CmsBlockData {
  cmsBlocks: {
    items: Array<{
      identifier: string;
      title: string;
      content: string;
    }>;
  };
}

interface CmsBlockProps {
  identifiers: string[];
  className?: string;
}

/**
 * CmsBlock component
 * Fetches and renders CMS blocks by identifier
 */
export const CmsBlock: React.FC<CmsBlockProps> = ({ identifiers, className = '' }) => {
  const { data, isLoading } = useQuery<CmsBlockData>({
    queryKey: ['cmsBlocks', identifiers],
    queryFn: async () => {
      return gqlClient.request(GET_CMS_BLOCKS, { identifiers });
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: identifiers.length > 0
  });

  if (isLoading) {
    return (
      <div className={`cms-block-loading ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!data?.cmsBlocks?.items || data.cmsBlocks.items.length === 0) {
    return null;
  }

  return (
    <div className={`cms-blocks ${className}`}>
      {data.cmsBlocks.items.map((block) => (
        <div key={block.identifier} className="cms-block mb-4">
          {block.title && <h3 className="text-lg font-semibold mb-2">{block.title}</h3>}
          <RichContent html={block.content} />
        </div>
      ))}
    </div>
  );
};

export default CmsBlock;

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { gqlClient } from '@/lib/graphql-client';
import { GET_CMS_BLOCKS } from '@/queries/cms';
import RichContent from '@/components/cms/RichContent';

interface BlockProps {
  blockId?: string;
  cssClasses?: string[];
}

export const Block: React.FC<BlockProps> = ({ blockId, cssClasses = [] }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['cmsBlock', blockId],
    queryFn: () => gqlClient.request(GET_CMS_BLOCKS, { identifiers: [blockId!] }),
    enabled: !!blockId,
    staleTime: 10 * 60 * 1000,
  });

  if (!blockId) return null;

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
    );
  }

  const block = data?.cmsBlocks?.items?.[0];
  if (!block) return null;

  return (
    <div className={`block-root ${cssClasses.join(' ')}`}>
      <RichContent html={block.content} />
    </div>
  );
};

export default Block;

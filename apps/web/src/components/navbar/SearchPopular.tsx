import { gqlClient } from '@/lib/graphql-client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { GET_POPULAR_KEYWORDS } from '@/queries/searchPopular';

export default function SearchPopular() {
  const { data } = useQuery({
    queryKey: ['popularKeywords'],
    queryFn: () => gqlClient.request(GET_POPULAR_KEYWORDS),
    staleTime: 5 * 60 * 1000,
  });

  const items = data?.getPopularKeywords?.items || [];

  if (!items.length) return null;

  return (
    <div className="mt-8 px-4 py-6 bg-white rounded-3xl shadow-lg">
      <h3 className="text-lg font-semibold mb-3">Popular search</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((keyword: any) => (
          <Link
            key={keyword.name}
            to={keyword.url_pwa || keyword.url || '#'}
            className="px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-700 hover:border-green-600 hover:text-green-600 transition"
          >
            {keyword.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { gql } from '@/lib/gql';
import { gqlClient } from '@/lib/graphql-client';
import { MapPin, Search } from 'lucide-react';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const GET_STORE_LOCATORS = gql`
  query GetStoreLocators($store_source_type: Int, $store_city: Int) {
    StoreLocators(store_source_type: $store_source_type, store_city: $store_city) {
      name
      street
      latitude
      longitude
      source_image_featured
    }
  }
`;

const GET_CITIES_FOR_STORES = gql`
  query GetCitiesForStores {
    getCities {
      city_id
      default_name
    }
  }
`;

export default function StoreLocatorPage() {
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');

  const { data: citiesData } = useQuery({
    queryKey: ['citiesForStores'],
    queryFn: () => gqlClient.request(GET_CITIES_FOR_STORES),
    staleTime: 10 * 60 * 1000,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['storeLocators', selectedCity],
    queryFn: () => gqlClient.request(GET_STORE_LOCATORS, {
      store_source_type: 1,
      store_city: selectedCity ?? undefined,
    }),
    staleTime: 5 * 60 * 1000,
  });

  const cities = citiesData?.getCities || [];
  const allStores = data?.StoreLocators || [];

  const stores = searchText
    ? allStores.filter((s: any) =>
        s.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        s.street?.toLowerCase().includes(searchText.toLowerCase())
      )
    : allStores;

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <Helmet>
        <title>Hệ thống siêu thị | MM Mega Market</title>
        <meta name="description" content="Tìm siêu thị MM Mega Market gần bạn nhất" />
      </Helmet>

      <Breadcrumbs />

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Hệ thống siêu thị</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Tìm kiếm siêu thị..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0272BA]"
          />
        </div>
        {cities.length > 0 && (
          <select
            value={selectedCity ?? ''}
            onChange={(e) => setSelectedCity(e.target.value ? Number(e.target.value) : null)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0272BA]"
          >
            <option value="">Tất cả tỉnh/thành</option>
            {cities.map((city: any) => (
              <option key={city.city_id} value={city.city_id}>
                {city.default_name}
              </option>
            ))}
          </select>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg border border-gray-200 p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-full mb-1" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <MapPin size={48} className="mx-auto mb-3 text-gray-300" />
          <p>Không tìm thấy siêu thị nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store: any, index: number) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              {store.source_image_featured && (
                <img
                  src={store.source_image_featured}
                  alt={store.name}
                  className="w-full h-32 object-cover rounded mb-3"
                  loading="lazy"
                />
              )}
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-[#0272BA] mt-0.5 flex-shrink-0" />
                <div>
                  <h2 className="font-semibold text-gray-800 text-sm mb-1">{store.name}</h2>
                  <p className="text-xs text-gray-500">{store.street}</p>
                </div>
              </div>
              {store.latitude && store.longitude && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 block text-center text-xs text-[#0272BA] border border-[#0272BA] rounded py-1.5 hover:bg-blue-50 transition-colors"
                >
                  Chỉ đường
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

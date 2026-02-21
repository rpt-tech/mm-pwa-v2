import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, X, Navigation, ChevronRight } from 'lucide-react';
import { gqlClient } from '@/lib/graphql-client';
import { gql } from '@/lib/gql';
import { GET_CITIES, GET_WARDS } from '@/queries/location';

const GET_STORE_VIEW = gql`
  query GetStoreView($street: String!, $city: String!, $ward: String!, $language: String!, $website: String!) {
    storeView(street: $street, city: $city, ward: $ward, language: $language, website: $website) {
      store_view_code {
        distance
        distance_text
        priority
        store_view_code
        source_name
      }
      message
      allow_selection
    }
  }
`;

const GET_STORE_INFORMATION = gql`
  query GetStoreInformation($storeViewCode: String!) {
    storeInformation(store_view_code: $storeViewCode) {
      source_code
      name
      address
    }
  }
`;

const GET_LOCATION_USER = gql`
  query GetLocationUser($lat: String!, $long: String!, $language: String!, $website: String!) {
    locationUser(lat: $lat, long: $long, language: $language, website: $website) {
      city
      city_code
      ward
      ward_code
      address
      store_view_code
    }
  }
`;

interface StoreViewCode {
  distance: number;
  distance_text: string;
  store_view_code: string;
  source_name: string;
}

interface StoreSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StoreSwitcher({ isOpen, onClose }: StoreSwitcherProps) {
  const [cityCode, setCityCode] = useState('');
  const [wardCode, setWardCode] = useState('');
  const [street, setStreet] = useState('');
  const [storeViews, setStoreViews] = useState<StoreViewCode[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  // Load current store from localStorage
  const currentStore = (() => {
    try {
      const s = localStorage.getItem('store');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  })();

  const { data: citiesData } = useQuery({
    queryKey: ['cities'],
    queryFn: () => gqlClient.request(GET_CITIES, { country_id: 'VN', is_new_administrative: 1 }),
    staleTime: 10 * 60 * 1000,
    enabled: isOpen,
  });

  const { data: wardsData } = useQuery({
    queryKey: ['wards', cityCode],
    queryFn: () => gqlClient.request(GET_WARDS, { city_code: cityCode }),
    enabled: !!cityCode && isOpen,
    staleTime: 5 * 60 * 1000,
  });

  const cities = citiesData?.getCities?.cities || [];
  const wards = wardsData?.getWard?.wards || [];

  const handleSearch = async () => {
    if (!cityCode) return;
    setIsSearching(true);
    try {
      const data = await gqlClient.request(GET_STORE_VIEW, {
        street: street || '',
        city: cityCode,
        ward: wardCode || '',
        language: 'vi',
        website: 'b2c',
      });
      setStoreViews(data?.storeView?.store_view_code || []);
    } catch (err) {
      console.error('Store view error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = await gqlClient.request(GET_LOCATION_USER, {
            lat: String(pos.coords.latitude),
            long: String(pos.coords.longitude),
            language: 'vi',
            website: 'b2c',
          });
          const loc = data?.locationUser;
          if (loc) {
            if (loc.city_code) setCityCode(loc.city_code);
            if (loc.ward_code) setWardCode(loc.ward_code);
            if (loc.address) setStreet(loc.address);
            // Auto-search after geolocation
            const viewData = await gqlClient.request(GET_STORE_VIEW, {
              street: loc.address || '',
              city: loc.city_code || '',
              ward: loc.ward_code || '',
              language: 'vi',
              website: 'b2c',
            });
            setStoreViews(viewData?.storeView?.store_view_code || []);
          }
        } catch (err) {
          console.error('Geolocation lookup error:', err);
        } finally {
          setIsLocating(false);
        }
      },
      () => setIsLocating(false)
    );
  };

  const handleSelectStore = async (storeViewCode: string) => {
    setSelectedStore(storeViewCode);
    try {
      const data = await gqlClient.request(GET_STORE_INFORMATION, { storeViewCode });
      const info = data?.storeInformation;
      if (info) {
        localStorage.setItem('store', JSON.stringify({
          storeViewCode,
          storeInformation: {
            source_code: info.source_code,
            name: info.name,
            address: info.address,
          },
        }));
        // Reload to apply store context
        window.location.reload();
      }
    } catch (err) {
      console.error('Store selection error:', err);
    } finally {
      setSelectedStore(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <MapPin size={20} className="text-[#0272BA]" />
            <h2 className="font-semibold text-gray-800">Chọn cửa hàng</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Current store */}
        {currentStore?.storeInformation && (
          <div className="p-4 bg-blue-50 border-b">
            <p className="text-xs text-[#0272BA] font-medium mb-1">Cửa hàng hiện tại</p>
            <p className="text-sm font-semibold">{currentStore.storeInformation.name}</p>
            <p className="text-xs text-gray-500">{currentStore.storeInformation.address}</p>
          </div>
        )}

        {/* Search form */}
        <div className="p-4 space-y-3">
          <div className="flex gap-2">
            <select
              value={cityCode}
              onChange={(e) => { setCityCode(e.target.value); setWardCode(''); setStoreViews([]); }}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0272BA]"
            >
              <option value="">Chọn Tỉnh/Thành phố</option>
              {cities.map((c: any) => (
                <option key={c.city_code} value={c.city_code}>{c.city}</option>
              ))}
            </select>
          </div>

          {cityCode && (
            <select
              value={wardCode}
              onChange={(e) => { setWardCode(e.target.value); setStoreViews([]); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0272BA]"
            >
              <option value="">Chọn Phường/Xã (tùy chọn)</option>
              {wards.map((w: any) => (
                <option key={w.ward_code} value={w.ward_code}>{w.ward}</option>
              ))}
            </select>
          )}

          <input
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="Số nhà, tên đường (tùy chọn)"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0272BA]"
          />

          <div className="flex gap-2">
            <button
              onClick={handleGeolocate}
              disabled={isLocating}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              <Navigation size={14} />
              {isLocating ? 'Đang định vị...' : 'Vị trí của tôi'}
            </button>
            <button
              onClick={handleSearch}
              disabled={!cityCode || isSearching}
              className="flex-1 py-2 bg-[#0272BA] text-white rounded-lg text-sm font-medium hover:bg-[#005a9e] disabled:opacity-50"
            >
              {isSearching ? 'Đang tìm...' : 'Tìm cửa hàng'}
            </button>
          </div>
        </div>

        {/* Results */}
        {storeViews.length > 0 && (
          <div className="border-t">
            <p className="px-4 py-2 text-xs text-gray-500 font-medium">
              {storeViews.length} cửa hàng gần bạn
            </p>
            <div className="divide-y">
              {storeViews.map((store) => (
                <button
                  key={store.store_view_code}
                  onClick={() => handleSelectStore(store.store_view_code)}
                  disabled={selectedStore === store.store_view_code}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-left disabled:opacity-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{store.source_name}</p>
                    {store.distance_text && (
                      <p className="text-xs text-gray-500">{store.distance_text}</p>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-gray-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {storeViews.length === 0 && cityCode && !isSearching && (
          <p className="px-4 pb-4 text-sm text-gray-500 text-center">
            Nhấn "Tìm cửa hàng" để xem danh sách cửa hàng gần bạn
          </p>
        )}
      </div>
    </div>
  );
}

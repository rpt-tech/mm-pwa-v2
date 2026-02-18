import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { gqlClient } from '@/lib/graphql-client';
import { GET_CITIES, GET_DISTRICTS, GET_WARDS } from '@/queries/location';

interface LocationOption {
  label: string;
  value: string;
}

interface VietnamLocationCascadeProps {
  cityCode?: string;
  districtCode?: string;
  wardCode?: string;
  onCityChange: (cityCode: string, cityName: string) => void;
  onDistrictChange: (districtCode: string, districtName: string) => void;
  onWardChange: (wardCode: string, wardName: string) => void;
  errors?: {
    city?: string;
    district?: string;
    ward?: string;
  };
}

export default function VietnamLocationCascade({
  cityCode = '',
  districtCode = '',
  wardCode = '',
  onCityChange,
  onDistrictChange,
  onWardChange,
  errors = {},
}: VietnamLocationCascadeProps) {
  const { t } = useTranslation();
  const [selectedCity, setSelectedCity] = useState(cityCode);
  const [selectedDistrict, setSelectedDistrict] = useState(districtCode);
  const [selectedWard, setSelectedWard] = useState(wardCode);

  // Fetch cities
  const { data: citiesData, isLoading: citiesLoading } = useQuery({
    queryKey: ['cities', 'VN'],
    queryFn: async () => {
      const data = await gqlClient.request(GET_CITIES, { countryId: 'VN' });
      return data.cities;
    },
  });

  // Fetch districts when city is selected
  const { data: districtsData, isLoading: districtsLoading } = useQuery({
    queryKey: ['districts', selectedCity],
    queryFn: async () => {
      const data = await gqlClient.request(GET_DISTRICTS, { cityCode: selectedCity });
      return data.districts;
    },
    enabled: !!selectedCity,
  });

  // Fetch wards when city is selected (wards API uses city_code, not district_code)
  const { data: wardsData, isLoading: wardsLoading } = useQuery({
    queryKey: ['wards', selectedCity],
    queryFn: async () => {
      const data = await gqlClient.request(GET_WARDS, { cityCode: selectedCity });
      return data.wards;
    },
    enabled: !!selectedCity,
  });

  // Update local state when props change
  useEffect(() => {
    setSelectedCity(cityCode);
  }, [cityCode]);

  useEffect(() => {
    setSelectedDistrict(districtCode);
  }, [districtCode]);

  useEffect(() => {
    setSelectedWard(wardCode);
  }, [wardCode]);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const label = e.target.selectedOptions[0]?.text || '';
    setSelectedCity(value);
    setSelectedDistrict('');
    setSelectedWard('');
    onCityChange(value, label);
    onDistrictChange('', '');
    onWardChange('', '');
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const label = e.target.selectedOptions[0]?.text || '';
    setSelectedDistrict(value);
    setSelectedWard('');
    onDistrictChange(value, label);
    onWardChange('', '');
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const label = e.target.selectedOptions[0]?.text || '';
    setSelectedWard(value);
    onWardChange(value, label);
  };

  const cities: LocationOption[] = citiesData
    ? citiesData.map((city: any) => ({
        label: city.name,
        value: city.city_code,
      }))
    : [];

  const districts: LocationOption[] = districtsData
    ? districtsData.map((district: any) => ({
        label: district.name,
        value: district.district_code,
      }))
    : [];

  const wards: LocationOption[] = wardsData
    ? wardsData.map((ward: any) => ({
        label: ward.name,
        value: ward.ward_code,
      }))
    : [];

  return (
    <div className="space-y-4">
      {/* City/Province */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('checkout.city')} <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedCity}
          onChange={handleCityChange}
          disabled={citiesLoading}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#006341] disabled:bg-gray-100"
        >
          <option value="">{t('checkout.selectCity')}</option>
          {cities.map((city) => (
            <option key={city.value} value={city.value}>
              {city.label}
            </option>
          ))}
        </select>
        {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
      </div>

      {/* District */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('checkout.district')} <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedDistrict}
          onChange={handleDistrictChange}
          disabled={!selectedCity || districtsLoading}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#006341] disabled:bg-gray-100"
        >
          <option value="">{t('checkout.selectDistrict')}</option>
          {districts.map((district) => (
            <option key={district.value} value={district.value}>
              {district.label}
            </option>
          ))}
        </select>
        {errors.district && <p className="mt-1 text-xs text-red-500">{errors.district}</p>}
      </div>

      {/* Ward */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('checkout.ward')} <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedWard}
          onChange={handleWardChange}
          disabled={!selectedDistrict || wardsLoading}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#006341] disabled:bg-gray-100"
        >
          <option value="">{t('checkout.selectWard')}</option>
          {wards.map((ward) => (
            <option key={ward.value} value={ward.value}>
              {ward.label}
            </option>
          ))}
        </select>
        {errors.ward && <p className="mt-1 text-xs text-red-500">{errors.ward}</p>}
      </div>
    </div>
  );
}

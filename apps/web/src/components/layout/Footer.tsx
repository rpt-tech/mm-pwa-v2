import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface StoreInfo {
  name: string;
  address: string;
  source_code: string;
}

export default function Footer() {
  const { t } = useTranslation();
  const location = useLocation();
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [servicesInView, setServicesInView] = useState(false);
  const [deliveryInView, setDeliveryInView] = useState(false);

  useEffect(() => {
    // Load store info from localStorage
    const store = localStorage.getItem('store');
    if (store) {
      try {
        const parsed = JSON.parse(store);
        setStoreInfo(parsed?.storeInformation || null);
      } catch (e) {
        console.error('Failed to parse store info', e);
      }
    }
  }, []);

  const isDNSC = storeInfo?.source_code === 'b2c_70010';
  const isCartPage = location.pathname === '/cart';

  // Google Maps URLs
  const encodedAddress = encodeURIComponent(
    storeInfo?.address ? storeInfo.address.replace(/\s*,\s*/g, ', ').trim() : ''
  );
  const googleMapsWebUrl = `https://www.google.com/maps/search/?q=${encodedAddress}`;
  const googleMapsAppUrl = `comgooglemaps://?q=${encodedAddress}`;
  const isMobile = /iPhone|Android.+Mobile|Windows Phone|BlackBerry/i.test(navigator.userAgent);

  return (
    <footer
      className={`max-w-[1482px] mx-auto ${isCartPage ? 'pb-[170px] md:pb-0' : ''} py-5 md:py-[30px]`}
      data-cy="Footer-root"
    >
      {/* Services Section */}
      <div className="mb-5 px-2.5 md:px-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-[30px]">
          {/* Placeholder for CMS Block: footer_services */}
          <div className="bg-[#F8F8F8] rounded p-2.5 md:p-[30px]">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-5 bg-gray-300 rounded"></div>
              <strong className="block mb-2 text-sm md:text-base font-medium md:font-bold">
                Service 1
              </strong>
              <p className="text-xs md:text-sm">Description</p>
            </div>
          </div>
          <div className="bg-[#F8F8F8] rounded p-2.5 md:p-[30px]">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-5 bg-gray-300 rounded"></div>
              <strong className="block mb-2 text-sm md:text-base font-medium md:font-bold">
                Service 2
              </strong>
              <p className="text-xs md:text-sm">Description</p>
            </div>
          </div>
          <div className="bg-[#F8F8F8] rounded p-2.5 md:p-[30px]">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-5 bg-gray-300 rounded"></div>
              <strong className="block mb-2 text-sm md:text-base font-medium md:font-bold">
                Service 3
              </strong>
              <p className="text-xs md:text-sm">Description</p>
            </div>
          </div>
          <div className="bg-[#F8F8F8] rounded p-2.5 md:p-[30px]">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-5 bg-gray-300 rounded"></div>
              <strong className="block mb-2 text-sm md:text-base font-medium md:font-bold">
                Service 4
              </strong>
              <p className="text-xs md:text-sm">Description</p>
            </div>
          </div>
        </div>
      </div>

      {/* Links Section */}
      <div className="bg-[#E3F3FF] rounded-none md:rounded px-5 md:px-[30px] py-5 md:py-[30px] flex flex-col md:flex-row md:gap-[30px]">
        {/* Store Information */}
        <div className="md:w-1/5 mb-2.5 md:mb-0">
          <div className="flex gap-2.5 md:block mb-2.5 md:mb-0">
            <Link to="/" className="block md:mb-5">
              <img
                src="/logo.svg"
                alt="Mega Market"
                className="max-h-[66px] md:max-h-[88px] w-[90px] md:w-[120px] object-contain"
                width={isDNSC ? 136 : 120}
                height={isDNSC ? 100 : 88}
              />
            </Link>
            <div>
              <strong className="block text-base md:text-lg font-bold mb-2">
                {storeInfo?.name || 'Store Name'}
              </strong>
              <p className="text-xs md:text-sm text-[#2A2F33] leading-5 mb-2">
                {storeInfo?.address || 'Store Address'}
              </p>
              <a
                className="inline-block rounded-full bg-white px-3 py-2.5 text-[#2A2F33] text-xs font-medium"
                href={isMobile ? googleMapsAppUrl : googleMapsWebUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('footer.buttonFindLocation', 'Find exact location')}
              </a>
            </div>
          </div>
          <div className="border-t border-[#C9E3F6] pt-2.5 md:pt-[25px] mt-2.5 md:mt-[25px]">
            <a href="http://online.gov.vn/Home/WebDetails/67169" target="_blank" rel="noopener noreferrer">
              <img src="/images/bct.png" alt="bo cong thuong" width="160" height="61" className="max-h-[61px] object-contain" />
            </a>
          </div>
        </div>

        {/* Footer Links - Placeholder for CMS Block: footer_links_v2 */}
        <div className="md:w-4/5 grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-[30px]">
          <div className="py-2.5 md:py-0 border-b md:border-b-0 border-[#C9E3F6]">
            <strong className="block text-base font-medium mb-2.5 md:mb-[15px]">Column 1</strong>
            <ul className="space-y-2.5 md:space-y-[15px]">
              <li className="hover:text-[#0272BA] cursor-pointer">Link 1</li>
              <li className="hover:text-[#0272BA] cursor-pointer">Link 2</li>
              <li className="hover:text-[#0272BA] cursor-pointer">Link 3</li>
            </ul>
          </div>
          <div className="py-2.5 md:py-0 border-b md:border-b-0 border-[#C9E3F6]">
            <strong className="block text-base font-medium mb-2.5 md:mb-[15px]">Column 2</strong>
            <ul className="space-y-2.5 md:space-y-[15px]">
              <li className="hover:text-[#0272BA] cursor-pointer">Link 1</li>
              <li className="hover:text-[#0272BA] cursor-pointer">Link 2</li>
              <li className="hover:text-[#0272BA] cursor-pointer">Link 3</li>
            </ul>
          </div>
          <div className="py-2.5 md:py-0">
            <strong className="block text-base font-medium mb-2.5 md:mb-[15px]">Social</strong>
            <div className="flex flex-wrap gap-2.5">
              <div className="w-10 h-10 bg-gray-300 rounded"></div>
              <div className="w-10 h-10 bg-gray-300 rounded"></div>
              <div className="w-10 h-10 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Section */}
      <div className="max-w-[937px] mx-auto px-5 py-5">
        {/* Placeholder for CMS Block: footer_delivery */}
        <div className="flex flex-col md:flex-row gap-5 md:gap-[20px] items-start md:items-center">
          <div className="flex gap-[15px] items-center">
            <div className="w-10 h-10 bg-gray-300 rounded"></div>
            <div>
              <strong className="text-[#0272BA]">Delivery Info</strong>
              <p className="text-sm">Details</p>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center md:border-t md:border-[#EAEAEA] md:pt-5 px-2.5 md:px-0">
        <p className="text-[#7A7E80] text-sm text-left md:text-center">
          &copy; {new Date().getFullYear()} MM Vietnam. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

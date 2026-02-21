import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CmsBlock from '@/components/cms/CmsBlock';
import Newsletter from '@/components/common/Newsletter';

interface StoreInfo {
  name: string;
  address: string;
  source_code: string;
}

export default function Footer() {
  const { t } = useTranslation();
  const location = useLocation();
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);

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
      {/* Services Section - CMS Block */}
      <div className="mb-5 px-2.5 md:px-0">
        <CmsBlock identifiers={['footer_services']} className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-[30px]" />
      </div>

      {/* Links Section */}
      <div className="bg-[#E3F3FF] rounded-none md:rounded px-5 md:px-[30px] py-5 md:py-[30px] flex flex-col md:flex-row md:gap-[30px]">
        {/* Store Information */}
        <div className="md:w-1/5 mb-2.5 md:mb-0">
          <div className="flex gap-2.5 md:block mb-2.5 md:mb-0">
            <Link to="/" className="block md:mb-5">
              <img
                src="/logo-footer.svg"
                alt="Mega Market"
                className="max-h-[66px] md:max-h-[88px] w-[90px] md:w-[120px] object-contain"
                width={isDNSC ? 136 : 120}
                height={isDNSC ? 100 : 88}
              />
            </Link>
            <div>
              <strong className="block text-base md:text-lg font-bold mb-2">
              {storeInfo?.name || 'MM Mega Market'}
              </strong>
              <p className="text-xs md:text-sm text-[#2A2F33] leading-5 mb-2">
                {storeInfo?.address || 'Việt Nam'}
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

        {/* Footer Links - CMS Block */}
        <div className="md:w-4/5">
          <CmsBlock identifiers={['footer_links_v2']} className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-[30px]" />
        </div>
      </div>

      {/* Delivery Section - CMS Block */}
      <div className="max-w-[937px] mx-auto px-5 py-5">
        <CmsBlock identifiers={['footer_delivery']} />
      </div>

      {/* Newsletter */}
      <div className="max-w-[937px] mx-auto px-5 pb-5">
        <Newsletter />
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

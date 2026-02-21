import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'isomorphic-dompurify';
import AdditionalAttributes from './AdditionalAttributes';
import ProductReviews from './ProductReviews';

interface DescriptionTabsProps {
  product: any;
}

export default function DescriptionTabs({ product }: DescriptionTabsProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');

  const hasDescription = !!product.description?.html;
  const hasSpecs = !!product.additional_attributes;
  const reviewCount = product.review_count || 0;

  const tabs = [
    { id: 'description' as const, label: t('product.description', 'Mô tả sản phẩm'), show: hasDescription },
    { id: 'specs' as const, label: t('product.specifications', 'Thông số kỹ thuật'), show: hasSpecs },
    { id: 'reviews' as const, label: `${t('product.reviews', 'Đánh giá')} (${reviewCount})`, show: true },
  ].filter((tab) => tab.show);

  if (tabs.length === 0) return null;

  return (
    <div className="mb-12">
      {/* Tab headers */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#0272BA] text-[#0272BA]'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'description' && hasDescription && (
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description.html) }} />
      )}

      {activeTab === 'specs' && hasSpecs && (
        <AdditionalAttributes attributes={product.additional_attributes} />
      )}

      {activeTab === 'reviews' && (
        <ProductReviews sku={product.sku} productName={product.ecom_name || product.name} />
      )}
    </div>
  );
}

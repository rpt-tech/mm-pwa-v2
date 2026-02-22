import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompareStore } from '@/stores/compareStore';

const CompareBar: React.FC = () => {
  const { items, removeFromCompare, clearCompare } = useCompareStore();
  const navigate = useNavigate();

  if (items.length < 2) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 overflow-x-auto">
          {items.map((product) => {
            const price =
              product.price_range.minimum_price?.final_price.value ??
              product.price_range.maximum_price?.final_price.value;
            return (
              <div
                key={product.uid}
                className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 min-w-[140px]"
              >
                <img
                  src={product.small_image?.url || '/placeholder.png'}
                  alt={product.ecom_name || product.name}
                  className="w-10 h-10 object-contain flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 truncate max-w-[80px]">
                    {product.ecom_name || product.name}
                  </p>
                  {price !== undefined && (
                    <p className="text-xs font-bold text-[#E82230]">
                      {price.toLocaleString('vi-VN')}₫
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeFromCompare(product.uid)}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0 text-sm leading-none"
                  aria-label="Xóa"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => navigate('/compare')}
            className="bg-[#0272BA] text-white text-sm font-medium px-4 py-2 rounded hover:bg-[#005a9e] transition-colors"
          >
            So sánh ({items.length})
          </button>
          <button
            onClick={clearCompare}
            className="text-gray-500 text-sm px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Xóa tất cả
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompareBar;

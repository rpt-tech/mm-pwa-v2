import React from 'react';

/**
 * ProductCardSkeleton
 * Pulse placeholder matching ProductCard layout: image, title (2 lines), unit, price
 */
const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Image area */}
      <div className="aspect-square bg-gray-200 animate-pulse" />

      {/* Info area */}
      <div className="p-3">
        {/* Title — 2 lines */}
        <div className="h-3.5 bg-gray-200 animate-pulse rounded mb-1.5" />
        <div className="h-3.5 bg-gray-200 animate-pulse rounded w-3/4 mb-2" />

        {/* Unit */}
        <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2 mb-2" />

        {/* Price */}
        <div className="h-5 bg-gray-200 animate-pulse rounded w-2/3" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;

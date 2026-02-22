import React from 'react';
import { Link } from 'react-router-dom';
import { useCompareStore } from '@/stores/compareStore';

const ComparePage: React.FC = () => {
  const { items, removeFromCompare, clearCompare } = useCompareStore();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Chưa có sản phẩm nào để so sánh.</p>
        <Link to="/" className="text-[#0272BA] hover:underline text-sm">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  const rows: { label: string; render: (p: (typeof items)[0]) => React.ReactNode }[] = [
    {
      label: 'Hình ảnh',
      render: (p) => (
        <img
          src={p.small_image?.url || '/placeholder.png'}
          alt={p.ecom_name || p.name}
          className="w-32 h-32 object-contain mx-auto"
        />
      ),
    },
    {
      label: 'Tên sản phẩm',
      render: (p) => (
        <Link to={`/product/${p.url_key}`} className="text-[#0272BA] hover:underline text-sm font-medium">
          {p.ecom_name || p.name}
        </Link>
      ),
    },
    {
      label: 'Giá',
      render: (p) => {
        const price =
          p.price_range.minimum_price?.final_price.value ??
          p.price_range.maximum_price?.final_price.value;
        return (
          <span className="text-[#E82230] font-bold">
            {price !== undefined ? `${price.toLocaleString('vi-VN')}₫` : '—'}
          </span>
        );
      },
    },
    {
      label: 'SKU',
      render: (p) => <span className="text-gray-600 text-sm">{p.sku}</span>,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">So sánh sản phẩm</h1>
        <button
          onClick={clearCompare}
          className="text-sm text-gray-500 hover:text-gray-700 border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
        >
          Xóa tất cả
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-32 border border-gray-200 bg-gray-50 p-3 text-left text-sm text-gray-600 font-medium">
                Thuộc tính
              </th>
              {items.map((product) => (
                <th key={product.uid} className="border border-gray-200 bg-gray-50 p-3 text-center min-w-[180px]">
                  <button
                    onClick={() => removeFromCompare(product.uid)}
                    className="text-xs text-red-500 hover:text-red-700 float-right"
                    aria-label="Xóa sản phẩm"
                  >
                    Xóa
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="hover:bg-gray-50">
                <td className="border border-gray-200 p-3 text-sm text-gray-600 font-medium bg-gray-50">
                  {row.label}
                </td>
                {items.map((product) => (
                  <td key={product.uid} className="border border-gray-200 p-3 text-center">
                    {row.render(product)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparePage;

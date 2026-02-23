import { Link } from 'react-router-dom';
import { Search, ShoppingBag } from 'lucide-react';

export default function HeroBanner() {
  return (
    <div className="relative bg-blue-600 text-white overflow-hidden py-16 lg:py-24">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full -ml-40 -mb-40"></div>
      </div>

      <div className="relative container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                Siêu thị trực tuyến <br />
                <span className="text-yellow-300">hàng chính hãng</span>
              </h1>
              <p className="text-lg text-blue-100">
                Hàng nghìn sản phẩm chất lượng, giao hàng nhanh chóng, giá cả cạnh tranh
              </p>
            </div>

            {/* Search bar */}
            <div className="flex gap-2 bg-white rounded-lg overflow-hidden shadow-lg">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="flex-1 px-4 py-3 text-gray-800 outline-none"
              />
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 transition-colors flex items-center gap-2">
                <Search size={20} />
              </button>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                to="/category"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg"
              >
                <ShoppingBag size={20} />
                Mua sắm ngay
              </Link>
              <Link
                to="/search"
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-lg font-semibold transition-colors border border-white/50"
              >
                Khám phá thêm
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/20">
              <div>
                <p className="text-2xl font-bold">10K+</p>
                <p className="text-sm text-blue-100">Sản phẩm</p>
              </div>
              <div>
                <p className="text-2xl font-bold">50K+</p>
                <p className="text-sm text-blue-100">Khách hàng</p>
              </div>
              <div>
                <p className="text-2xl font-bold">24/7</p>
                <p className="text-sm text-blue-100">Hỗ trợ</p>
              </div>
            </div>
          </div>

          {/* Right image */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-yellow-400 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="aspect-square bg-gradient-to-br from-red-500/20 to-yellow-400/20 rounded-2xl flex items-center justify-center">
                  <div className="text-6xl">🛒</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

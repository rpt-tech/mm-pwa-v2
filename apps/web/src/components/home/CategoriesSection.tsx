import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const categories = [
  { name: 'Thực phẩm tươi sống', icon: '🥩', color: 'from-red-500 to-red-600' },
  { name: 'Rau củ quả', icon: '🥦', color: 'from-green-500 to-green-600' },
  { name: 'Đồ uống', icon: '🥤', color: 'from-blue-500 to-blue-600' },
  { name: 'Bánh kẹo', icon: '🍰', color: 'from-yellow-500 to-yellow-600' },
  { name: 'Gia vị & Nước chấm', icon: '🧂', color: 'from-orange-500 to-orange-600' },
  { name: 'Chăm sóc cá nhân', icon: '🧴', color: 'from-purple-500 to-purple-600' },
];

export default function CategoriesSection() {
  return (
    <div className="bg-gray-50 py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Danh mục nổi bật
            </h2>
            <p className="text-gray-600">Khám phá các danh mục sản phẩm chính của chúng tôi</p>
          </div>
          <Link
            to="/category"
            className="hidden md:flex items-center gap-2 text-[#0272BA] hover:text-[#005a9e] font-semibold transition-colors"
          >
            Xem tất cả <ChevronRight size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to="/category"
              className="group relative overflow-hidden rounded-2xl aspect-square"
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-90 group-hover:opacity-100 transition-opacity`}></div>

              {/* Content */}
              <div className="relative h-full flex flex-col items-center justify-center text-white p-4 text-center">
                <div className="text-4xl mb-2 group-hover:scale-125 transition-transform duration-300">
                  {cat.icon}
                </div>
                <p className="text-sm font-semibold leading-tight group-hover:translate-y-1 transition-transform">
                  {cat.name}
                </p>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
            </Link>
          ))}
        </div>

        <div className="mt-8 md:hidden">
          <Link
            to="/category"
            className="w-full flex items-center justify-center gap-2 bg-[#0272BA] hover:bg-[#005a9e] text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Xem tất cả danh mục <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}

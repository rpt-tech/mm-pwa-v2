import { Link } from 'react-router-dom';
import { Zap, Gift, TrendingUp } from 'lucide-react';

const promotions = [
  {
    title: 'Flash Sale',
    desc: 'Giảm giá lên đến 70%',
    icon: Zap,
    color: 'bg-gradient-to-br from-red-500 to-orange-500',
    link: '/flash-sale'
  },
  {
    title: 'Khuyến mãi hôm nay',
    desc: 'Mua 2 tặng 1 cho các sản phẩm chọn lọc',
    icon: Gift,
    color: 'bg-gradient-to-br from-green-500 to-emerald-500',
    link: '/promotions'
  },
  {
    title: 'Bán chạy nhất',
    desc: 'Những sản phẩm được yêu thích nhất',
    icon: TrendingUp,
    color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    link: '/best-sellers'
  },
];

export default function PromotionsSection() {
  return (
    <div className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-12">
          Ưu đãi đặc biệt
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {promotions.map((promo) => {
            const Icon = promo.icon;
            return (
              <Link
                key={promo.title}
                to={promo.link}
                className={`group relative overflow-hidden rounded-2xl p-8 text-white transition-transform hover:scale-105 ${promo.color}`}
              >
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{promo.title}</h3>
                      <p className="text-white/90 text-lg font-semibold">{promo.desc}</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-lg group-hover:bg-white/30 transition-colors">
                      <Icon size={28} />
                    </div>
                  </div>
                  <div className="text-sm text-white/80 group-hover:text-white transition-colors">
                    Xem chi tiết →
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

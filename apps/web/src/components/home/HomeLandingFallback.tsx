import { Link } from 'react-router-dom';

const categories = [
  { name: 'Thực phẩm tươi sống', href: '/category', icon: '🥩' },
  { name: 'Rau củ quả', href: '/category', icon: '🥦' },
  { name: 'Đồ uống', href: '/category', icon: '🥤' },
  { name: 'Bánh kẹo', href: '/category', icon: '🍰' },
  { name: 'Gia vị & Nước chấm', href: '/category', icon: '🧂' },
  { name: 'Chăm sóc cá nhân', href: '/category', icon: '🧴' },
];

const features = [
  { icon: '🚚', title: 'Giao hàng nhanh', desc: 'Giao hàng tận nơi toàn quốc' },
  { icon: '✅', title: 'Hàng chính hãng', desc: 'Cam kết 100% hàng thật' },
  { icon: '💳', title: 'Thanh toán đa dạng', desc: 'COD, Momo, VNPay, ZaloPay' },
];

export default function HomeLandingFallback() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-[#0272BA] text-white">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="max-w-2xl">
            <h1 className="text-3xl lg:text-4xl font-bold mb-3">
              Chào mừng đến MM Vietnam
            </h1>
            <p className="text-lg text-blue-100 mb-6">
              Siêu thị trực tuyến với hàng nghìn sản phẩm chất lượng, giao hàng tận nơi trên toàn quốc.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/category"
                className="inline-flex items-center gap-2 bg-[#E82230] hover:bg-[#B2202A] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Mua sắm ngay
              </Link>
              <Link
                to="/search"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold transition-colors border border-white/30"
              >
                Tìm kiếm sản phẩm
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="flex items-center gap-3">
                <span className="text-2xl">{f.icon}</span>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-gray-800">{f.title}</p>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Danh mục nổi bật</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={cat.href}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#0272BA] hover:shadow-md transition-all text-center"
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-xs font-medium text-gray-700 leading-tight">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Giỏ hàng', href: '/cart', color: 'bg-orange-50 border-orange-200 text-orange-700' },
            { label: 'Thanh toán', href: '/checkout', color: 'bg-green-50 border-green-200 text-green-700' },
            { label: 'Tài khoản', href: '/account/dashboard', color: 'bg-blue-50 border-blue-200 text-blue-700' },
            { label: 'Đăng nhập', href: '/sign-in', color: 'bg-purple-50 border-purple-200 text-purple-700' },
          ].map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={`flex items-center justify-center p-4 rounded-xl border font-medium text-sm transition-all hover:shadow-md ${link.color}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

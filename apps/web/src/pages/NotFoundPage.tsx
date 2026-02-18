import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-[#006341]">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mt-4">
            Không tìm thấy trang
          </h2>
          <p className="text-gray-600 mt-2">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-[#006341] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#004d32] transition-colors"
          >
            <Home size={20} />
            Về trang chủ
          </Link>
          <Link
            to="/search"
            className="inline-flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:border-gray-400 transition-colors"
          >
            <Search size={20} />
            Tìm kiếm
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Hoặc liên hệ hỗ trợ:</p>
          <a
            href="tel:1900636467"
            className="text-[#006341] hover:underline font-medium"
          >
            1900 636 467
          </a>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export default function PWAInstallBanner() {
  const { isInstallable, promptInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50 flex items-start gap-3">
      <div className="flex-shrink-0 w-10 h-10 bg-[#006341] rounded-lg flex items-center justify-center">
        <Download size={20} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">Cài đặt ứng dụng MM</p>
        <p className="text-xs text-gray-500 mt-0.5">Trải nghiệm mua sắm nhanh hơn, tiện lợi hơn</p>
        <button
          onClick={promptInstall}
          className="mt-2 text-xs bg-[#006341] text-white px-3 py-1.5 rounded-lg hover:bg-[#004d32] transition-colors"
        >
          Cài đặt ngay
        </button>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Đóng"
      >
        <X size={16} />
      </button>
    </div>
  );
}

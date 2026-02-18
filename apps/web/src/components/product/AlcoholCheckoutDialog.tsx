import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

interface AlcoholCheckoutDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
  isBusy?: boolean;
}

export default function AlcoholCheckoutDialog({
  isOpen,
  onConfirm,
  onClose,
  isBusy = false
}: AlcoholCheckoutDialogProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{t('global.notification')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isBusy}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 text-center">
            {t('alcoholDialog.redirectToCart', {
              defaultValue: 'Please remove all alcohol and 18+ products from your cart to continue. Click confirm to return to the cart page.'
            })}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t">
          <button
            onClick={onConfirm}
            disabled={isBusy}
            className="px-6 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isBusy ? t('global.loading') : t('global.confirm', { defaultValue: 'Confirm' })}
          </button>
        </div>

        {/* Loading overlay */}
        {isBusy && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}

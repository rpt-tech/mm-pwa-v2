import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

interface AlcoholDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isBusy?: boolean;
}

export default function AlcoholDialog({
  isOpen,
  onConfirm,
  onCancel,
  isBusy = false
}: AlcoholDialogProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{t('global.notification')}</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
            disabled={isBusy}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <img
            src="/images/18+.png"
            alt="18+"
            width={120}
            height={120}
            className="mx-auto mb-4"
          />
          <p className="text-gray-700">
            {t('alcoholDialog.confirmMessage', {
              defaultValue: 'Please confirm that you are at least 18 years old to continue viewing content or purchasing this product.'
            }).split('18 years old').map((part, i, arr) => (
              i < arr.length - 1 ? (
                <span key={i}>
                  {part}
                  <strong className="text-red-600">18 years old</strong>
                </span>
              ) : part
            ))}
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t">
          <button
            onClick={onCancel}
            disabled={isBusy}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            {t('alcoholDialog.cancel', { defaultValue: 'Under 18 years old' })}
          </button>
          <button
            onClick={onConfirm}
            disabled={isBusy}
            className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
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

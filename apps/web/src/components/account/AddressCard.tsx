import { useTranslation } from 'react-i18next';
import { Trash2, Edit2 } from 'lucide-react';

interface Address {
  id: number;
  firstname: string;
  telephone: string;
  default_shipping: boolean;
  is_new_administrative: boolean;
  city: string;
  street: string[];
  custom_attributes?: Array<{
    attribute_code: string;
    value: string;
  }>;
}

interface AddressCardProps {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  isConfirmingDelete: boolean;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  isConfirmingDelete,
  onCancelDelete,
  onConfirmDelete,
}: AddressCardProps) {
  const { t } = useTranslation();
  const {
    firstname,
    telephone,
    default_shipping,
    is_new_administrative,
    city,
    street,
    custom_attributes,
  } = address;

  const district = custom_attributes?.find((attr) => attr.attribute_code === 'district')?.value || '';
  const ward = custom_attributes?.find((attr) => attr.attribute_code === 'ward')?.value || '';

  const additionalAddressString = `${ward ? ', ' + ward : ''}${!is_new_administrative && district ? ', ' + district : ''}${city ? ', ' + city : ''}`;

  return (
    <>
      <div className="border border-gray-200 rounded-lg p-4 hover:border-[#006341] transition-colors">
        <div className="mb-3">
          {default_shipping && (
            <span className="inline-block bg-[#006341] text-white text-xs px-2 py-1 rounded mb-2">
              {t('account.defaultAddress')}
            </span>
          )}
          <div className="font-medium text-gray-900">
            {firstname} - {telephone}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {street.map((row, index) => (
              <span key={index} className="block">
                {row}
              </span>
            ))}
            {additionalAddressString}
          </p>
          {!is_new_administrative && (
            <p className="text-xs text-orange-600 mt-2">
              {t('account.updateNewAdministrative')}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {!default_shipping && (
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-1 text-sm text-[#0272BA] hover:text-[#005a94] transition-colors"
            >
              <Trash2 size={16} />
              <span>{t('account.delete')}</span>
            </button>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1 text-sm text-[#0272BA] hover:text-[#005a94] transition-colors ml-auto"
          >
            <Edit2 size={16} />
            <span>{t('account.edit')}</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {isConfirmingDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">{t('account.deleteAddress')}</h3>
            <p className="text-gray-600 mb-6">{t('account.confirmDeleteAddress')}</p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onCancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={onConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

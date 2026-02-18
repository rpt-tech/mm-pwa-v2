import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import VietnamLocationCascade from '@/components/checkout/VietnamLocationCascade';

const addressSchema = z.object({
  firstname: z.string().min(1, 'First name is required'),
  telephone: z.string().regex(/^[0-9]{10,11}$/, 'Invalid phone number'),
  street: z.string().min(1, 'Street address is required'),
  city_code: z.string().min(1, 'City is required'),
  ward_code: z.string().min(1, 'Ward is required'),
  default_shipping: z.boolean().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AddEditAddressDialogProps {
  isOpen: boolean;
  isEditMode: boolean;
  initialValues?: any;
  onCancel: () => void;
  onConfirm: (values: any) => void;
  isBusy: boolean;
}

export default function AddEditAddressDialog({
  isOpen,
  isEditMode,
  initialValues,
  onCancel,
  onConfirm,
  isBusy,
}: AddEditAddressDialogProps) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      firstname: '',
      telephone: '',
      street: '',
      city_code: '',
      ward_code: '',
      default_shipping: false,
    },
  });

  const cityCode = watch('city_code');
  const wardCode = watch('ward_code');

  // Reset form when dialog opens/closes or initialValues change
  useEffect(() => {
    if (isOpen && initialValues) {
      const cityCodeValue = initialValues.is_new_administrative
        ? initialValues.custom_attributes?.find((attr: any) => attr.attribute_code === 'city_code')?.value || ''
        : '';
      const wardCodeValue = initialValues.is_new_administrative
        ? initialValues.custom_attributes?.find((attr: any) => attr.attribute_code === 'ward_code')?.value || ''
        : '';

      reset({
        firstname: initialValues.firstname || '',
        telephone: initialValues.telephone || '',
        street: initialValues.street?.[0] || '',
        city_code: cityCodeValue,
        ward_code: wardCodeValue,
        default_shipping: initialValues.default_shipping || false,
      });
    } else if (isOpen && !isEditMode) {
      reset({
        firstname: '',
        telephone: '',
        street: '',
        city_code: '',
        ward_code: '',
        default_shipping: false,
      });
    }
  }, [isOpen, initialValues, isEditMode, reset]);

  const onSubmit = (data: AddressFormData) => {
    const formValues = {
      firstname: data.firstname,
      telephone: data.telephone,
      street: [data.street],
      city_code: data.city_code,
      ward_code: data.ward_code,
      default_shipping: data.default_shipping || false,
    };
    onConfirm(formValues);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {isEditMode ? t('account.editAddress') : t('account.addAddress')}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
            disabled={isBusy}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="mb-4 p-3 bg-blue-50 text-sm text-blue-800 rounded">
            {t('account.newAdministrativeNote')}
          </div>

          <div className="space-y-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('account.firstName')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('firstname')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#006341]"
                placeholder={t('account.firstName')}
              />
              {errors.firstname && (
                <p className="mt-1 text-xs text-red-500">{errors.firstname.message}</p>
              )}
            </div>

            {/* Telephone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('account.telephone')} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                {...register('telephone')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#006341]"
                placeholder={t('account.telephone')}
              />
              {errors.telephone && (
                <p className="mt-1 text-xs text-red-500">{errors.telephone.message}</p>
              )}
            </div>

            {/* Vietnam Location Cascade */}
            <VietnamLocationCascade
              cityCode={cityCode}
              districtCode=""
              wardCode={wardCode}
              onCityChange={(code) => {
                setValue('city_code', code, { shouldValidate: true });
              }}
              onDistrictChange={() => {
                // District change handled by cascade
              }}
              onWardChange={(code) => {
                setValue('ward_code', code, { shouldValidate: true });
              }}
              errors={{
                city: errors.city_code?.message,
                ward: errors.ward_code?.message,
              }}
            />

            {/* Street Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('account.streetAddress')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('street')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#006341]"
                placeholder={t('account.streetAddress')}
              />
              {errors.street && (
                <p className="mt-1 text-xs text-red-500">{errors.street.message}</p>
              )}
            </div>

            {/* Default Address Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="default_shipping"
                {...register('default_shipping')}
                className="w-4 h-4 text-[#006341] border-gray-300 rounded focus:ring-[#006341]"
              />
              <label htmlFor="default_shipping" className="ml-2 text-sm text-gray-700">
                {t('account.makeDefaultAddress')}
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={isBusy}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isBusy}
              className="flex-1 px-4 py-2 bg-[#006341] text-white rounded-lg hover:bg-[#004d33] disabled:opacity-50"
            >
              {isBusy ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

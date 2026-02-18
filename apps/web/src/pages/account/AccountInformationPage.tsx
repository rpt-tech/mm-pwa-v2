import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import MyAccountLayout from '@/components/account/MyAccountLayout';
import { gqlClient } from '@/lib/graphql-client';
import { GET_CUSTOMER, UPDATE_CUSTOMER, CHANGE_PASSWORD } from '@/queries/account';
import { useAuthStore } from '@/stores/authStore';
import { Loader2 } from 'lucide-react';

const accountInfoSchema = z.object({
  firstname: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  telephone: z.string().min(10, 'Phone number must be at least 10 digits'),
  customer_no: z.string().optional(),
  password: z.string().min(1, 'Password is required to save changes'),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
  company_name: z.string().optional(),
  company_vat_number: z.string().optional(),
  company_address: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AccountInfoFormData = z.infer<typeof accountInfoSchema>;

export default function AccountInformationPage() {
  const { t } = useTranslation();
  const { token } = useAuthStore();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showVatFields, setShowVatFields] = useState(false);

  const { data: customerData, isLoading, refetch } = useQuery({
    queryKey: ['customer'],
    queryFn: async () => {
      const data = await gqlClient.request(GET_CUSTOMER, {}, {
        Authorization: `Bearer ${token}`,
      });
      return data.customer;
    },
    enabled: !!token,
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async (variables: any) => {
      return await gqlClient.request(UPDATE_CUSTOMER, variables, {
        Authorization: `Bearer ${token}`,
      });
    },
    onSuccess: () => {
      refetch();
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (variables: { currentPassword: string; newPassword: string }) => {
      return await gqlClient.request(CHANGE_PASSWORD, variables, {
        Authorization: `Bearer ${token}`,
      });
    },
  });

  const phoneNumber = customerData?.custom_attributes?.find(
    (attr: any) => attr.code === 'company_user_phone_number'
  )?.value || '';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccountInfoFormData>({
    resolver: zodResolver(accountInfoSchema),
    values: customerData ? {
      firstname: customerData.firstname || '',
      email: customerData.email || '',
      telephone: phoneNumber,
      customer_no: customerData.customer_no || '',
      password: '',
      newPassword: '',
      confirmPassword: '',
      company_name: customerData.vat_address?.company_name || '',
      company_vat_number: customerData.vat_address?.company_vat_number || '',
      company_address: customerData.vat_address?.company_address || '',
    } : undefined,
  });

  const onSubmit = async (formData: AccountInfoFormData) => {
    try {
      const {
        email,
        firstname,
        telephone,
        customer_no,
        password,
        newPassword,
        company_name,
        company_vat_number,
        company_address,
      } = formData;

      let isChanged = false;

      const customerInput: any = {
        email: email.trim(),
        firstname: firstname.trim(),
        password: password.trim(),
        custom_attributes: [
          {
            attribute_code: 'company_user_phone_number',
            value: telephone.trim(),
          },
        ],
      };

      // Handle customer_no (13 digits) or mcard_no (16 digits)
      if (customer_no) {
        const trimmedCustomerNo = customer_no.trim();
        if (trimmedCustomerNo.length === 13) {
          customerInput.customer_no = trimmedCustomerNo;
        } else if (trimmedCustomerNo.length === 16) {
          customerInput.mcard_no = trimmedCustomerNo;
        }
      }

      // Add VAT fields if shown
      if (showVatFields && (company_name || company_vat_number || company_address)) {
        customerInput.vat_address = {
          company_name: company_name?.trim() || '',
          company_vat_number: company_vat_number?.trim() || '',
          company_address: company_address?.trim() || '',
        };
      }

      // Check if customer info changed
      if (
        customerData.email !== email.trim() ||
        customerData.firstname !== firstname.trim() ||
        phoneNumber !== telephone.trim() ||
        customerData.customer_no !== customer_no?.trim() ||
        (showVatFields && (
          customerData.vat_address?.company_name !== company_name?.trim() ||
          customerData.vat_address?.company_vat_number !== company_vat_number?.trim() ||
          customerData.vat_address?.company_address !== company_address?.trim()
        ))
      ) {
        isChanged = true;
        await updateCustomerMutation.mutateAsync({ customerInput });
      }

      // Change password if provided
      if (password && newPassword) {
        isChanged = true;
        await changePasswordMutation.mutateAsync({
          currentPassword: password.trim(),
          newPassword: newPassword.trim(),
        });
      }

      if (isChanged) {
        alert(t('account.informationUpdated'));
        setShowChangePassword(false);
      } else {
        alert(t('account.noChanges'));
      }
    } catch (error: any) {
      alert(error.message || 'Failed to update account information');
    }
  };

  if (isLoading) {
    return (
      <MyAccountLayout currentPage="accountInformation">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MyAccountLayout>
    );
  }

  return (
    <MyAccountLayout currentPage="accountInformation">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">{t('account.myProfile')}</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="firstname" className="block text-sm font-medium mb-2">
              {t('account.fullName')} <span className="text-red-500">*</span>
            </label>
            <input
              {...register('firstname')}
              type="text"
              id="firstname"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder={t('account.fullName')}
            />
            {errors.firstname && (
              <p className="text-red-500 text-sm mt-1">{errors.firstname.message}</p>
            )}
          </div>

          {/* Email and Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                {t('account.email')} <span className="text-red-500">*</span>
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={t('account.email')}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="telephone" className="block text-sm font-medium mb-2">
                {t('account.telephone')} <span className="text-red-500">*</span>
              </label>
              <input
                {...register('telephone')}
                type="tel"
                id="telephone"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={t('account.telephone')}
              />
              {errors.telephone && (
                <p className="text-red-500 text-sm mt-1">{errors.telephone.message}</p>
              )}
            </div>
          </div>

          {/* Customer No / MCard */}
          <div>
            <label htmlFor="customer_no" className="block text-sm font-medium mb-2">
              {t('account.mcardCode')}
            </label>
            <input
              {...register('customer_no')}
              type="text"
              id="customer_no"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder={t('account.enterMcardCode')}
            />
            <p className="text-sm text-gray-500 mt-1">
              * {t('account.mcardNote')}
            </p>
            {errors.customer_no && (
              <p className="text-red-500 text-sm mt-1">{errors.customer_no.message}</p>
            )}
          </div>

          {/* Password (required to save) */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              {t('account.password')} <span className="text-red-500">*</span>
            </label>
            <input
              {...register('password')}
              type="password"
              id="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder={t('account.enterPassword')}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Toggle buttons */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowChangePassword(!showChangePassword)}
              className={`text-sm font-medium ${showChangePassword ? 'text-primary' : 'text-gray-600'} hover:text-primary`}
            >
              {t('account.changePassword')}
            </button>
            <br />
            <button
              type="button"
              onClick={() => setShowVatFields(!showVatFields)}
              className={`text-sm font-medium ${showVatFields ? 'text-primary' : 'text-gray-600'} hover:text-primary`}
            >
              {t('account.exportCompanyInvoices')}
            </button>
          </div>

          {/* Change Password Fields */}
          {showChangePassword && (
            <div className="border-t pt-6 space-y-4">
              <h3 className="font-medium">{t('account.changePassword')}</h3>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                  {t('account.newPassword')}
                </label>
                <input
                  {...register('newPassword')}
                  type="password"
                  id="newPassword"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t('account.enterNewPassword')}
                />
                {errors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  {t('account.confirmPassword')}
                </label>
                <input
                  {...register('confirmPassword')}
                  type="password"
                  id="confirmPassword"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t('account.confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          )}

          {/* VAT Fields */}
          {showVatFields && (
            <div className="border-t pt-6 space-y-4">
              <h3 className="font-medium">{t('account.exportCompanyInvoices')}</h3>
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium mb-2">
                  {t('account.companyName')}
                </label>
                <input
                  {...register('company_name')}
                  type="text"
                  id="company_name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t('account.enterCompanyName')}
                />
              </div>
              <div>
                <label htmlFor="company_vat_number" className="block text-sm font-medium mb-2">
                  {t('account.companyTaxCode')}
                </label>
                <input
                  {...register('company_vat_number')}
                  type="text"
                  id="company_vat_number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t('account.enterCompanyTaxCode')}
                />
              </div>
              <div>
                <label htmlFor="company_address" className="block text-sm font-medium mb-2">
                  {t('account.companyAddress')}
                </label>
                <input
                  {...register('company_address')}
                  type="text"
                  id="company_address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t('account.enterCompanyAddress')}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('account.saveInformation')}
            </button>
          </div>
        </form>
      </div>
    </MyAccountLayout>
  );
}

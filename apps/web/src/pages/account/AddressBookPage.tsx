import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import MyAccountLayout from '@/components/account/MyAccountLayout';
import AddressCard from '@/components/account/AddressCard';
import AddEditAddressDialog from '@/components/account/AddEditAddressDialog';
import { gqlClient } from '@/lib/graphql-client';
import {
  GET_CUSTOMER_ADDRESSES_PAGINATED,
  CREATE_CUSTOMER_ADDRESS,
  UPDATE_CUSTOMER_ADDRESS,
  DELETE_CUSTOMER_ADDRESS,
} from '@/queries/account';

const PAGE_SIZE = 4;

export default function AddressBookPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogEditMode, setIsDialogEditMode] = useState(false);
  const [formAddress, setFormAddress] = useState<any>({});
  const [confirmDeleteAddressId, setConfirmDeleteAddressId] = useState<number | null>(null);

  // Fetch addresses with pagination
  const { data, isLoading } = useQuery({
    queryKey: ['customerAddresses', currentPage],
    queryFn: async () => {
      const result = await gqlClient.request(GET_CUSTOMER_ADDRESSES_PAGINATED, {
        currentPage,
        pageSize: PAGE_SIZE,
      });
      return result.customer.addressesV2;
    },
  });

  const addresses = data?.addresses || [];
  const totalPages = data?.total_pages || 0;
  const totalCount = data?.total_count || 0;

  // Adjust current page if it exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0 && !isLoading) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages, isLoading]);

  // Create address mutation
  const createMutation = useMutation({
    mutationFn: async (address: any) => {
      return await gqlClient.request(CREATE_CUSTOMER_ADDRESS, { address });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerAddresses'] });
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      setIsDialogOpen(false);
    },
  });

  // Update address mutation
  const updateMutation = useMutation({
    mutationFn: async ({ addressId, address }: { addressId: number; address: any }) => {
      return await gqlClient.request(UPDATE_CUSTOMER_ADDRESS, {
        addressId,
        updated_address: address,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerAddresses'] });
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      setIsDialogOpen(false);
    },
  });

  // Delete address mutation
  const deleteMutation = useMutation({
    mutationFn: async (addressId: number) => {
      return await gqlClient.request(DELETE_CUSTOMER_ADDRESS, { addressId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerAddresses'] });
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      setConfirmDeleteAddressId(null);
    },
  });

  const handleAddAddress = () => {
    setIsDialogEditMode(false);
    setFormAddress({});
    setIsDialogOpen(true);
  };

  const handleEditAddress = (address: any) => {
    setIsDialogEditMode(true);
    setFormAddress(address);
    setIsDialogOpen(true);
  };

  const handleDeleteAddress = (addressId: number) => {
    setConfirmDeleteAddressId(addressId);
  };

  const handleCancelDelete = () => {
    setConfirmDeleteAddressId(null);
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteAddressId) {
      deleteMutation.mutate(confirmDeleteAddressId);
    }
  };

  const handleCancelDialog = () => {
    setIsDialogOpen(false);
  };

  const handleConfirmDialog = (formValues: any) => {
    const address = {
      firstname: formValues.firstname,
      lastname: formValues.lastname || '.',
      telephone: formValues.telephone,
      default_shipping: formValues.default_shipping || false,
      default_billing: formValues.default_shipping || false,
      country_code: 'VN',
      city: formValues.city_code,
      postcode: '00000',
      street: formValues.street.filter((e: string) => e),
      custom_attributes: [
        {
          attribute_code: 'city_code',
          value: formValues.city_code,
        },
        {
          attribute_code: 'ward_code',
          value: formValues.ward_code,
        },
      ],
    };

    if (isDialogEditMode) {
      updateMutation.mutate({ addressId: formAddress.id, address });
    } else {
      createMutation.mutate(address);
    }
  };

  // Sort addresses: default first
  const sortedAddresses = [...addresses].sort((a, b) => {
    if (a.default_shipping) return -1;
    if (b.default_shipping) return 1;
    return 0;
  });

  // Pagination controls
  const pagesToShow = [];
  const startPage = Math.max(1, currentPage - 1);
  const endPage = Math.min(totalPages - 1, currentPage + 1);

  if (currentPage === 1) {
    pagesToShow.push(1);
    if (totalPages > 2) pagesToShow.push(2);
    if (totalPages > 3) pagesToShow.push(3);
  } else if (currentPage === totalPages || currentPage === totalPages - 1) {
    if (totalPages > 3) pagesToShow.push(totalPages - 3);
    if (totalPages > 2) pagesToShow.push(totalPages - 2);
    if (totalPages > 1) pagesToShow.push(totalPages - 1);
  } else {
    for (let i = startPage; i <= endPage; i++) {
      pagesToShow.push(i);
    }
  }
  if (totalPages > 1) {
    pagesToShow.push(totalPages);
  }

  const isBusy = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <MyAccountLayout currentPage="addressBook">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('account.addressBook')}</h2>
        <button
          type="button"
          onClick={handleAddAddress}
          className="flex items-center gap-2 bg-[#006341] text-white px-4 py-2 rounded-lg hover:bg-[#004d33] transition-colors"
        >
          <Plus size={20} />
          <span>{t('account.addAddress')}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006341]"></div>
        </div>
      ) : totalCount > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {sortedAddresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={() => handleEditAddress(address)}
                onDelete={() => handleDeleteAddress(address.id)}
                isConfirmingDelete={confirmDeleteAddressId === address.id}
                onCancelDelete={handleCancelDelete}
                onConfirmDelete={handleConfirmDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              {pagesToShow.map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded ${
                    currentPage === page
                      ? 'bg-[#006341] text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>{t('account.noAddresses')}</p>
        </div>
      )}

      <AddEditAddressDialog
        isOpen={isDialogOpen}
        isEditMode={isDialogEditMode}
        initialValues={formAddress}
        onCancel={handleCancelDialog}
        onConfirm={handleConfirmDialog}
        isBusy={isBusy}
      />
    </MyAccountLayout>
  );
}

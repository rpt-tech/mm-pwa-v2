import FilterSidebar from './FilterSidebar';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: any[];
  selectedFilters: Record<string, any>;
  onFilterChange: (filterKey: string, value: string | null) => void;
  onClearAll: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  selectedFilters,
  onFilterChange,
  onClearAll,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-start justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-4 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900">
            Close
          </button>
        </div>
        <FilterSidebar
          filters={filters}
          selectedFilters={selectedFilters}
          onFilterChange={onFilterChange}
          onClearAll={onClearAll}
          isLoading={false}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0272BA] text-white rounded-md hover:bg-[#005a9e]"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;

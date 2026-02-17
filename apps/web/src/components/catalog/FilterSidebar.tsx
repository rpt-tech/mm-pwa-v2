import { useState } from 'react';

interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface Filter {
  label: string;
  attribute_code: string;
  options: FilterOption[];
  count?: number;
}

interface FilterSidebarProps {
  filters: Filter[];
  selectedFilters: Record<string, any>;
  onFilterChange: (filterKey: string, value: string | null) => void;
  onClearAll: () => void;
  isLoading: boolean;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  selectedFilters,
  onFilterChange,
  onClearAll,
  isLoading,
}) => {
  const [expandedFilters, setExpandedFilters] = useState<Set<string>>(new Set(['price', 'category_id']));

  const toggleFilter = (attributeCode: string) => {
    setExpandedFilters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(attributeCode)) {
        newSet.delete(attributeCode);
      } else {
        newSet.add(attributeCode);
      }
      return newSet;
    });
  };

  const hasActiveFilters = Object.keys(selectedFilters).some(
    (key) => key !== 'category_uid'
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-2" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Clear All Button */}
      {hasActiveFilters && (
        <button
          onClick={onClearAll}
          className="w-full px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50"
        >
          Clear All Filters
        </button>
      )}

      {/* Filter Groups */}
      {filters.map((filter) => {
        if (!filter.options || filter.options.length === 0) return null;

        const isExpanded = expandedFilters.has(filter.attribute_code);
        const isPrice = filter.attribute_code === 'price';

        return (
          <div key={filter.attribute_code} className="border-b pb-4">
            <button
              onClick={() => toggleFilter(filter.attribute_code)}
              className="flex items-center justify-between w-full text-left font-semibold mb-2"
            >
              <span>{filter.label}</span>
              <span className="text-gray-500">{isExpanded ? '−' : '+'}</span>
            </button>

            {isExpanded && (
              <div className="space-y-2 mt-2">
                {isPrice ? (
                  // Price range filter
                  <div className="space-y-2">
                    {filter.options.map((option) => {
                      const [from, to] = option.value.split('_');
                      const isSelected =
                        selectedFilters[filter.attribute_code]?.from === from &&
                        selectedFilters[filter.attribute_code]?.to === to;

                      return (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                        >
                          <input
                            type="radio"
                            name="price"
                            checked={isSelected}
                            onChange={() =>
                              onFilterChange(
                                filter.attribute_code,
                                isSelected ? null : option.value
                              )
                            }
                            className="w-4 h-4"
                          />
                          <span className="text-sm">
                            {option.label}
                            {option.count !== undefined && (
                              <span className="text-gray-500 ml-1">({option.count})</span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  // Multi-select filter
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filter.options.map((option) => {
                      const selectedValues = selectedFilters[filter.attribute_code]?.in || [];
                      const isSelected = selectedValues.includes(option.value);

                      return (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              const newValues = isSelected
                                ? selectedValues.filter((v: string) => v !== option.value)
                                : [...selectedValues, option.value];

                              onFilterChange(
                                filter.attribute_code,
                                newValues.length > 0 ? newValues.join(',') : null
                              );
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">
                            {option.label}
                            {option.count !== undefined && (
                              <span className="text-gray-500 ml-1">({option.count})</span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FilterSidebar;

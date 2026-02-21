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
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800 text-sm">Bộ lọc</h3>
        {hasActiveFilters && (
          <button onClick={onClearAll} className="text-xs text-[#E82230] hover:underline">
            Xóa tất cả
          </button>
        )}
      </div>

      <div className="space-y-1">
        {/* Filter Groups */}
        {filters.map((filter) => {
          if (!filter.options || filter.options.length === 0) return null;

          const isExpanded = expandedFilters.has(filter.attribute_code);
          const isPrice = filter.attribute_code === 'price';

          return (
            <div key={filter.attribute_code} className="border-b border-gray-100 last:border-0">
              <button
                onClick={() => toggleFilter(filter.attribute_code)}
                className="flex items-center justify-between w-full text-left py-2.5 text-sm font-medium text-gray-700 hover:text-[#0272BA]"
              >
                <span>{filter.label}</span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && (
                <div className="pb-3 space-y-1.5">
                  {isPrice ? (
                    filter.options.map((option) => {
                      const [from, to] = option.value.split('_');
                      const isSelected =
                        selectedFilters[filter.attribute_code]?.from === from &&
                        selectedFilters[filter.attribute_code]?.to === to;
                      return (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="radio"
                            name="price"
                            checked={isSelected}
                            onChange={() => onFilterChange(filter.attribute_code, isSelected ? null : option.value)}
                            className="w-3.5 h-3.5 accent-[#0272BA]"
                          />
                          <span className={`text-xs group-hover:text-[#0272BA] ${isSelected ? 'text-[#0272BA] font-medium' : 'text-gray-600'}`}>
                            {option.label}
                            {option.count !== undefined && <span className="text-gray-400 ml-1">({option.count})</span>}
                          </span>
                        </label>
                      );
                    })
                  ) : (
                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                      {filter.options.map((option) => {
                        const selectedValues = selectedFilters[filter.attribute_code]?.in || [];
                        const isSelected = selectedValues.includes(option.value);
                        return (
                          <label key={option.value} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                const newValues = isSelected
                                  ? selectedValues.filter((v: string) => v !== option.value)
                                  : [...selectedValues, option.value];
                                onFilterChange(filter.attribute_code, newValues.length > 0 ? newValues.join(',') : null);
                              }}
                              className="w-3.5 h-3.5 accent-[#0272BA] rounded"
                            />
                            <span className={`text-xs group-hover:text-[#0272BA] ${isSelected ? 'text-[#0272BA] font-medium' : 'text-gray-600'}`}>
                              {option.label}
                              {option.count !== undefined && <span className="text-gray-400 ml-1">({option.count})</span>}
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
    </div>
  );
};

export default FilterSidebar;

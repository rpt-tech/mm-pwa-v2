interface SortFieldOption {
  label: string;
  value: string;
}

interface ProductSortProps {
  sortFields: SortFieldOption[];
  currentSort: { attribute: string; direction: string };
  onSortChange: (attribute: string, direction: string) => void;
  isLoading: boolean;
}

const ProductSort: React.FC<ProductSortProps> = ({
  sortFields,
  currentSort,
  onSortChange,
  isLoading,
}) => {
  if (isLoading) {
    return <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />;
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm font-semibold text-gray-700">
        Sort by
      </label>
      <select
        id="sort"
        value={`${currentSort.attribute}_${currentSort.direction}`}
        onChange={(event) => {
          const [attribute, direction] = event.target.value.split('_');
          onSortChange(attribute || 'position', direction || 'ASC');
        }}
        className="px-3 py-2 border border-gray-300 rounded"
      >
        {sortFields.map((field) => (
          <option key={field.value} value={`${field.value}_ASC`}>
            {field.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProductSort;

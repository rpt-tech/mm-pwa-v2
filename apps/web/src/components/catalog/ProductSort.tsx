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

const ProductSort: React.FC<ProductSortProps> = ({ sortFields, currentSort, onSortChange, isLoading }) => {
  if (isLoading) return <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />;

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-xs text-gray-500 whitespace-nowrap">Sắp xếp:</label>
      <select
        id="sort"
        value={`${currentSort.attribute}_${currentSort.direction}`}
        onChange={(e) => {
          const [attribute, direction] = e.target.value.split('_');
          onSortChange(attribute || 'position', direction || 'ASC');
        }}
        className="text-sm px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-[#0272BA] text-gray-700"
      >
        {sortFields.map((field) => (
          <option key={field.value} value={`${field.value}_ASC`}>{field.label}</option>
        ))}
      </select>
    </div>
  );
};

export default ProductSort;

interface SwatchData {
  value?: string;
  thumbnail?: string;
}

interface OptionValue {
  uid: string;
  label: string;
  value_index: number;
  swatch_data?: SwatchData;
}

interface ConfigurableOption {
  uid: string;
  attribute_code: string;
  label: string;
  values: OptionValue[];
}

interface Variant {
  attributes: { code: string; value_index: number }[];
  product: { stock_status: string };
}

interface ProductOptionsProps {
  options: ConfigurableOption[];
  selectedOptions: Record<string, string>;
  onSelectionChange: (options: Record<string, string>) => void;
  variants?: Variant[];
}

/** Returns a Set of value_index values that have at least one in-stock variant */
function getInStockValueIndices(
  attributeCode: string,
  variants: Variant[],
  selectedOptions: Record<string, string>,
  allOptions: ConfigurableOption[],
): Set<number> {
  const inStock = new Set<number>();
  for (const variant of variants) {
    if (variant.product.stock_status === 'OUT_OF_STOCK') continue;
    // Check if this variant is compatible with currently selected options (excluding the current attribute)
    const compatible = allOptions.every((opt) => {
      if (opt.attribute_code === attributeCode) return true;
      const selectedUid = selectedOptions[opt.attribute_code];
      if (!selectedUid) return true;
      const selectedValue = opt.values.find((v) => v.uid === selectedUid);
      if (!selectedValue) return true;
      return variant.attributes.some(
        (a) => a.code === opt.attribute_code && a.value_index === selectedValue.value_index,
      );
    });
    if (compatible) {
      const attr = variant.attributes.find((a) => a.code === attributeCode);
      if (attr) inStock.add(attr.value_index);
    }
  }
  return inStock;
}

export default function ProductOptions({
  options,
  selectedOptions,
  onSelectionChange,
  variants = [],
}: ProductOptionsProps) {
  const handleOptionSelect = (attributeCode: string, optionUid: string) => {
    onSelectionChange({
      ...selectedOptions,
      [attributeCode]: optionUid,
    });
  };

  return (
    <div className="space-y-6">
      {options.map((option) => {
        const selectedValue = selectedOptions[option.attribute_code];
        const selectedLabel = option.values.find((v) => v.uid === selectedValue)?.label;
        const inStockIndices = variants.length > 0
          ? getInStockValueIndices(option.attribute_code, variants, selectedOptions, options)
          : null;

        return (
          <div key={option.uid}>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700">
                {option.label}
              </label>
              {selectedLabel && (
                <span className="text-sm text-gray-600">{selectedLabel}</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const isSelected = selectedValue === value.uid;
                const isOOS = inStockIndices !== null && !inStockIndices.has(value.value_index);
                const hasSwatch = value.swatch_data?.value || value.swatch_data?.thumbnail;

                // Color swatch
                if (hasSwatch && value.swatch_data?.value?.startsWith('#')) {
                  return (
                    <button
                      key={value.uid}
                      onClick={() => !isOOS && handleOptionSelect(option.attribute_code, value.uid)}
                      disabled={isOOS}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        isOOS
                          ? 'opacity-40 cursor-not-allowed border-gray-200'
                          : isSelected
                          ? 'border-[#0272BA] ring-2 ring-[#0272BA]/30'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: value.swatch_data.value }}
                      title={isOOS ? `${value.label} (Hết hàng)` : value.label}
                      aria-label={isOOS ? `${value.label} - Hết hàng` : value.label}
                    />
                  );
                }

                // Image swatch
                if (hasSwatch && value.swatch_data?.thumbnail) {
                  return (
                    <button
                      key={value.uid}
                      onClick={() => !isOOS && handleOptionSelect(option.attribute_code, value.uid)}
                      disabled={isOOS}
                      className={`w-12 h-12 rounded-lg border-2 overflow-hidden transition-all ${
                        isOOS
                          ? 'opacity-40 cursor-not-allowed border-gray-200'
                          : isSelected
                          ? 'border-[#0272BA] ring-2 ring-[#0272BA]/30'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      title={isOOS ? `${value.label} (Hết hàng)` : value.label}
                      aria-label={isOOS ? `${value.label} - Hết hàng` : value.label}
                    >
                      <img
                        src={value.swatch_data.thumbnail}
                        alt={value.label}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                }

                // Text option
                return (
                  <button
                    key={value.uid}
                    onClick={() => !isOOS && handleOptionSelect(option.attribute_code, value.uid)}
                    disabled={isOOS}
                    className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all relative ${
                      isOOS
                        ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-400 line-through'
                        : isSelected
                        ? 'border-[#0272BA] bg-blue-50 text-[#0272BA]'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    {value.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}


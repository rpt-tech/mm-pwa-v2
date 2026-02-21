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

interface ProductOptionsProps {
  options: ConfigurableOption[];
  selectedOptions: Record<string, string>;
  onSelectionChange: (options: Record<string, string>) => void;
}

export default function ProductOptions({
  options,
  selectedOptions,
  onSelectionChange,
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
                const hasSwatch = value.swatch_data?.value || value.swatch_data?.thumbnail;

                // Color swatch
                if (hasSwatch && value.swatch_data?.value?.startsWith('#')) {
                  return (
                    <button
                      key={value.uid}
                      onClick={() => handleOptionSelect(option.attribute_code, value.uid)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        isSelected
                          ? 'border-[#0272BA] ring-2 ring-[#0272BA]/30'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: value.swatch_data.value }}
                      title={value.label}
                      aria-label={value.label}
                    />
                  );
                }

                // Image swatch
                if (hasSwatch && value.swatch_data?.thumbnail) {
                  return (
                    <button
                      key={value.uid}
                      onClick={() => handleOptionSelect(option.attribute_code, value.uid)}
                      className={`w-12 h-12 rounded-lg border-2 overflow-hidden transition-all ${
                        isSelected
                          ? 'border-[#0272BA] ring-2 ring-[#0272BA]/30'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      title={value.label}
                      aria-label={value.label}
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
                    onClick={() => handleOptionSelect(option.attribute_code, value.uid)}
                    className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                      isSelected
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

import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  step = 1,
  disabled = false,
}: QuantityStepperProps) {
  const handleDecrement = () => {
    const newVal = Math.max(min, value - step);
    if (newVal !== value) onChange(parseFloat(newVal.toFixed(2)));
  };

  const handleIncrement = () => {
    const newVal = Math.min(max, value + step);
    if (newVal !== value) onChange(parseFloat(newVal.toFixed(2)));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Decrease quantity"
      >
        <Minus className="w-4 h-4" />
      </button>
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className="w-16 text-center border-x border-gray-300 py-2 focus:outline-none disabled:bg-gray-50"
        aria-label="Quantity"
      />
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Increase quantity"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

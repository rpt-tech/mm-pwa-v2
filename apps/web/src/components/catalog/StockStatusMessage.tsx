import React from 'react';

interface StockStatusMessageProps {
  stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK';
  className?: string;
}

const StockStatusMessage: React.FC<StockStatusMessageProps> = ({ stockStatus, className = '' }) => {
  if (stockStatus === 'IN_STOCK') {
    return null;
  }

  return (
    <div className={`stock-status-message out-of-stock ${className}`}>
      <span>Hết hàng</span>
    </div>
  );
};

export default StockStatusMessage;

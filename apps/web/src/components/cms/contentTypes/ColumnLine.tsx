import React from 'react';

interface ColumnLineProps {
  display?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export const ColumnLine: React.FC<ColumnLineProps> = ({ display, children }) => {
  return (
    <div style={{ display }} className="columnLine flex flex-wrap">
      {children}
    </div>
  );
};

export default ColumnLine;

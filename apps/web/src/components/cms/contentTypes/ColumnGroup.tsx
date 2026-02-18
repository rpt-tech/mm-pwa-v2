import React from 'react';

interface ColumnGroupProps {
  display?: 'flex' | 'grid';
  gridTemplateColumns?: string;
  gap?: string;
  backgroundColor?: string;
  textAlign?: string;
  border?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  cssClasses?: string[];
  children?: React.ReactNode;
}

/**
 * ColumnGroup ContentType component
 * Container for Column components, creates grid/flex layouts
 */
export const ColumnGroup: React.FC<ColumnGroupProps> = ({
  display = 'flex',
  gridTemplateColumns,
  gap = '1rem',
  backgroundColor,
  textAlign,
  border,
  borderColor,
  borderWidth,
  borderRadius,
  marginTop,
  marginRight,
  marginBottom,
  marginLeft,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  cssClasses = [],
  children
}) => {
  const dynamicStyles: React.CSSProperties = {
    display,
    gap,
    backgroundColor,
    textAlign: textAlign as any,
    border,
    borderColor,
    borderWidth,
    borderRadius,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft
  };

  if (display === 'grid' && gridTemplateColumns) {
    dynamicStyles.gridTemplateColumns = gridTemplateColumns;
  }

  return (
    <div className={`column-group ${cssClasses.join(' ')}`} style={dynamicStyles}>
      {children}
    </div>
  );
};

export default ColumnGroup;

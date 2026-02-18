import React from 'react';

interface ColumnProps {
  width?: string;
  verticalAlignment?: 'top' | 'middle' | 'bottom';
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
 * Column ContentType component
 * Used within ColumnGroup to create grid layouts
 */
export const Column: React.FC<ColumnProps> = ({
  width = '100%',
  verticalAlignment,
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
    width,
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

  if (verticalAlignment) {
    dynamicStyles.display = 'flex';
    dynamicStyles.flexDirection = 'column';
    dynamicStyles.justifyContent =
      verticalAlignment === 'top'
        ? 'flex-start'
        : verticalAlignment === 'bottom'
        ? 'flex-end'
        : 'center';
  }

  return (
    <div className={`column ${cssClasses.join(' ')}`} style={dynamicStyles}>
      {children}
    </div>
  );
};

export default Column;

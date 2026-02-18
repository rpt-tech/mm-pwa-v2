import React from 'react';

interface RowProps {
  appearance?: 'contained' | 'full-width' | 'full-bleed';
  verticalAlignment?: 'top' | 'middle' | 'bottom';
  minHeight?: string;
  backgroundColor?: string;
  desktopImage?: string;
  mobileImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundAttachment?: string;
  backgroundRepeat?: string;
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
 * Row ContentType component
 * Container for other content types with flexible layout options
 */
export const Row: React.FC<RowProps> = ({
  appearance = 'contained',
  verticalAlignment,
  minHeight,
  backgroundColor,
  desktopImage,
  mobileImage,
  backgroundSize = 'cover',
  backgroundPosition = 'center',
  backgroundAttachment = 'scroll',
  backgroundRepeat = 'no-repeat',
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
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
  const image = isMobile && mobileImage ? mobileImage : desktopImage;

  const dynamicStyles: React.CSSProperties = {
    minHeight,
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

  if (image) {
    dynamicStyles.backgroundImage = `url(${image})`;
    dynamicStyles.backgroundSize = backgroundSize;
    dynamicStyles.backgroundPosition = backgroundPosition;
    dynamicStyles.backgroundAttachment = backgroundAttachment;
    dynamicStyles.backgroundRepeat = backgroundRepeat;
  }

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

  if (appearance === 'full-bleed') {
    return (
      <div
        className={`row-full-bleed w-full ${cssClasses.join(' ')}`}
        style={{
          ...dynamicStyles,
          marginLeft: undefined,
          marginRight: undefined
        }}
      >
        {children}
      </div>
    );
  }

  if (appearance === 'full-width') {
    return (
      <div
        className={`row-full-width w-full ${cssClasses.join(' ')}`}
        style={{
          ...dynamicStyles,
          marginLeft: undefined,
          marginRight: undefined
        }}
      >
        <div className="container mx-auto px-4">{children}</div>
      </div>
    );
  }

  return (
    <div className={`row-contained container mx-auto px-4 ${cssClasses.join(' ')}`}>
      <div className="row-inner" style={dynamicStyles}>
        {children}
      </div>
    </div>
  );
};

export default Row;

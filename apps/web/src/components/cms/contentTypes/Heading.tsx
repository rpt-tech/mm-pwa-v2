import React from 'react';

interface HeadingProps {
  headingType?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  text?: string;
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
}

export const Heading: React.FC<HeadingProps> = ({
  headingType = 'h2',
  text = '',
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
}) => {
  const style: React.CSSProperties = {
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
    paddingLeft,
  };

  const Tag = headingType as keyof JSX.IntrinsicElements;
  return (
    <Tag
      className={`heading-${headingType} ${cssClasses.join(' ')}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );
};

export default Heading;

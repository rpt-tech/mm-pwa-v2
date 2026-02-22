import React from 'react';

interface ButtonsProps {
  isSameWidth?: boolean;
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

export const Buttons: React.FC<ButtonsProps> = ({
  isSameWidth = false,
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
  children,
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

  return (
    <div
      className={`buttons-root flex flex-wrap gap-2 ${isSameWidth ? 'buttons-same-width' : ''} ${cssClasses.join(' ')}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default Buttons;

import React from 'react';

interface ButtonItemProps {
  text?: string;
  link?: string;
  openInNewTab?: boolean;
  buttonType?: 'primary' | 'secondary' | 'link';
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

export const ButtonItem: React.FC<ButtonItemProps> = ({
  text = '',
  link,
  openInNewTab = false,
  buttonType = 'primary',
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

  const typeClass =
    buttonType === 'primary'
      ? 'bg-[#0272BA] text-white hover:bg-[#005a9e]'
      : buttonType === 'secondary'
      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
      : 'text-[#0272BA] hover:underline';

  const className = `button-item inline-block px-6 py-2 rounded font-medium transition-colors ${typeClass} ${cssClasses.join(' ')}`;

  if (link) {
    return (
      <a
        href={link}
        className={className}
        style={style}
        {...(openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }

  return (
    <button
      type="button"
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );
};

export default ButtonItem;

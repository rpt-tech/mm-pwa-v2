import React from 'react';

interface DividerProps {
  width?: string;
  color?: string;
  thickness?: string;
  textAlign?: string;
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

export const Divider: React.FC<DividerProps> = ({
  width = '100%',
  color = '#cccccc',
  thickness = '1px',
  textAlign,
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
  const wrapperStyle: React.CSSProperties = {
    textAlign: textAlign as any,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
  };

  const hrStyle: React.CSSProperties = {
    width,
    borderTopColor: color,
    borderTopWidth: thickness,
    borderTopStyle: 'solid',
    borderBottom: 'none',
    margin: '0 auto',
  };

  return (
    <div className={`divider-root ${cssClasses.join(' ')}`} style={wrapperStyle}>
      <hr style={hrStyle} />
    </div>
  );
};

export default Divider;

import React, { Fragment } from 'react';

interface ProductLabelData {
  label_id: string;
  label_priority: number;
  product_image?: LabelConfig;
  category_image?: LabelConfig;
}

interface LabelConfig {
  type: number;
  url?: string;
  position?: string;
  display: boolean;
  text?: string;
  text_color?: string;
  text_size?: number;
  shape_type?: string;
  shape_color?: string;
  label_size?: number;
  label_size_mobile?: number;
  custom_css?: string;
}

interface ProductLabelProps {
  labelData?: ProductLabelData[];
  currentPage: 'product_image' | 'category_image';
  percent?: number;
  amount?: number;
  currencyCode?: string;
}

const ProductLabel: React.FC<ProductLabelProps> = ({
  labelData,
  currentPage,
  percent = 0,
  amount = 0,
  currencyCode = 'VND',
}) => {
  if (!labelData || !Array.isArray(labelData)) {
    return null;
  }

  // Filter and sort labels by priority
  const labelItems = Object.values(
    labelData.reduce((acc: Record<string, ProductLabelData>, item) => {
      const labelConfig = item[currentPage];
      if (!labelConfig) return acc;

      const position = labelConfig.position || 'top-left';
      if (
        labelConfig.display &&
        (!acc[position] || item.label_priority < acc[position].label_priority)
      ) {
        acc[position] = item;
      }
      return acc;
    }, {})
  ).sort((a, b) => {
    const aPriority = Number.isFinite(a?.label_priority) ? a.label_priority : -Infinity;
    const bPriority = Number.isFinite(b?.label_priority) ? b.label_priority : -Infinity;
    return bPriority - aPriority;
  });

  if (labelItems.length === 0) {
    return null;
  }

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currencyCode,
    }).format(value);
  };

  return (
    <>
      {labelItems.map((item, index) => {
        const labelItem = item[currentPage];
        if (!labelItem) return null;

        const labelIdClass = item.label_id ? `productLabelId${item.label_id}` : '';
        const labelPositionClass = labelItem.position || '';
        const labelSize = labelItem.label_size || 60;

        let labelText: React.ReactNode = labelItem.text || '';
        if (typeof labelText === 'string') {
          let textStr = labelText;
          if (textStr.includes('{{percent}}')) {
            textStr = textStr.replace('{{percent}}', `${percent}%`);
          }
          if (textStr.includes('{{amount}}')) {
            const labelTextParts = textStr.split('{{amount}}');
            labelText = (
              <span>
                {labelTextParts[0]}
                {formatPrice(amount)}
                {labelTextParts[1]}
              </span>
            );
          } else {
            labelText = textStr;
          }
        }

        const textStyle: React.CSSProperties = {
          fontSize: labelItem.text_size ? `${labelItem.text_size}px` : '16px',
          color: labelItem.text_color || '#000000',
        };

        // Type 1: Text only
        if (labelItem.type === 1) {
          return (
            <Fragment key={index}>
              <div
                className={`product-label text-only ${labelPositionClass} ${labelIdClass}`}
                style={{ position: 'absolute' }}
              >
                <div className="label-text" style={textStyle}>
                  <span>{labelText}</span>
                </div>
              </div>
              {labelItem.custom_css && <style>{labelItem.custom_css}</style>}
            </Fragment>
          );
        }

        // Type 2: Shape with text
        if (labelItem.type === 2) {
          let shapeViewBox = '0 0 180 60';
          switch (labelItem.shape_type) {
            case 'shape-new-7':
            case 'shape-new-8':
            case 'shape-new-17':
            case 'shape-new-20':
            case 'shape-new-22':
              shapeViewBox = '0 0 60 60';
              break;
            case 'shape-new-12':
            case 'shape-new-13':
            case 'shape-new-14':
              shapeViewBox = '0 0 45 60';
              break;
            case 'shape-new-16':
              shapeViewBox = '0 0 120 60';
              break;
            case 'shape-new-18':
              shapeViewBox = '0 0 41.398 60';
              break;
            case 'shape-new-19':
              shapeViewBox = '0 0 38.421 60';
              break;
            case 'shape-new-21':
              shapeViewBox = '0 0 63 18';
              break;
          }

          return (
            <Fragment key={index}>
              <div
                className={`product-label shape-layout ${labelPositionClass} ${labelIdClass}`}
                style={{ width: `${labelSize}px`, position: 'absolute' }}
              >
                <div className={`label-shape ${labelItem.shape_type}`}>
                  <svg
                    fill={labelItem.shape_color || '#000000'}
                    viewBox={shapeViewBox}
                    xmlSpace="preserve"
                  >
                    <use x="0" y="0" xlinkHref={`#${labelItem.shape_type}`}></use>
                  </svg>
                  <span className="text" style={textStyle}>
                    <span>{labelText}</span>
                  </span>
                </div>
              </div>
              {labelItem.custom_css && <style>{labelItem.custom_css}</style>}
            </Fragment>
          );
        }

        // Type 3: Image
        if (labelItem.type === 3) {
          return (
            <Fragment key={index}>
              <div
                className={`product-label image-layout ${labelPositionClass} ${labelIdClass}`}
                style={{ width: `${labelSize}px`, position: 'absolute' }}
              >
                <div className="label-image">
                  <img src={labelItem.url || ''} alt="" />
                </div>
              </div>
              {labelItem.custom_css && <style>{labelItem.custom_css}</style>}
            </Fragment>
          );
        }

        // Type 4: Frame
        if (labelItem.type === 4) {
          return (
            <Fragment key={index}>
              <div className={`product-label frame-layout ${labelIdClass}`}>
                <img src={labelItem.url || ''} alt="" />
              </div>
              {labelItem.custom_css && <style>{labelItem.custom_css}</style>}
            </Fragment>
          );
        }

        return null;
      })}
    </>
  );
};

export default ProductLabel;

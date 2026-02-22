/**
 * ContentType Factory
 * Maps PageBuilder content types to React components
 */

import React from 'react';
import { Banner } from './Banner';
import { Row } from './Row';
import { Column } from './Column';
import { ColumnGroup } from './ColumnGroup';
import { ColumnLine } from './ColumnLine';
import { Html } from './Html';
import { Image } from './Image';
import { Text } from './Text';
import SliderComponent from './Slider';
import ProductsCarousel from './ProductsCarousel';
import FlashsaleProductsCT from './FlashsaleProductsCT';
import ProductRecommendationCT from './ProductRecommendationCT';
import { Heading } from './Heading';
import { Buttons } from './Buttons';
import { ButtonItem } from './ButtonItem';
import { Divider } from './Divider';
import { Block } from './Block';

export interface ContentTypeData {
  contentType: string;
  children?: ContentTypeData[];
  [key: string]: any;
}

/** Recursively render children from parsed PageBuilder data */
function renderChildren(children?: ContentTypeData[]): React.ReactNode {
  if (!children || children.length === 0) return null;
  return children.map((child, i) => (
    <ContentTypeFactory key={`${child.contentType}-${i}`} data={child} />
  ));
}

/**
 * Renders a PageBuilder content type based on its type
 */
export const ContentTypeFactory: React.FC<{ data: ContentTypeData }> = ({ data }) => {
  const { contentType, children, ...props } = data;
  const renderedChildren = renderChildren(children);

  switch (contentType) {
    case 'row':
      return <Row {...props as any}>{renderedChildren}</Row>;

    case 'column-group':
      return <ColumnGroup {...props as any}>{renderedChildren}</ColumnGroup>;

    case 'column-line':
      return <ColumnLine {...props as any}>{renderedChildren}</ColumnLine>;

    case 'column':
      return <Column {...props as any}>{renderedChildren}</Column>;

    case 'banner':
      return <Banner {...props as any} />;

    case 'slider':
      return <SliderComponent {...props as any}>{renderedChildren}</SliderComponent>;

    case 'html':
      return <Html {...props as any} />;

    case 'image':
      return <Image {...props as any} />;

    case 'text':
      return <Text {...props as any} />;

    case 'products':
      return <ProductsCarousel {...props as any} />;

    case 'flashsale-products':
      return <FlashsaleProductsCT {...props as any} />;

    case 'product-recommendation':
      return <ProductRecommendationCT {...props as any} />;

    case 'heading':
      return <Heading {...props as any} />;

    case 'buttons':
      return <Buttons {...props as any}>{renderedChildren}</Buttons>;

    case 'button-item':
      return <ButtonItem {...props as any} />;

    case 'divider':
      return <Divider {...props as any} />;

    case 'block':
      return <Block {...props as any} />;

    // slide is a banner inside a slider
    case 'slide':
      return <Banner {...props as any} />;

    default:
      if (typeof window !== 'undefined' && (window as any).__DEV__) {
        console.warn(`Unknown content type: ${contentType}`);
      }
      return null;
  }
};

export default ContentTypeFactory;

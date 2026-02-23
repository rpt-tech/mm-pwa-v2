import React from 'react';
import { lazy, Suspense } from 'react';
import DOMPurify from 'isomorphic-dompurify';

const FlashsaleProductsCT = lazy(() => import('./FlashsaleProductsCT'));
const ProductRecommendationCT = lazy(() => import('./ProductRecommendationCT'));

interface HtmlProps {
  html: string;
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

/**
 * Html ContentType component
 * Renders raw HTML content with styling.
 * Also handles ___widget_* shortcodes for custom MM Vietnam widgets
 * (flashsale products, product recommendations) embedded in html blocks.
 */
export const Html: React.FC<HtmlProps> = ({
  html,
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
  cssClasses = []
}) => {
  const dynamicStyles: React.CSSProperties = {
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

  const trimmed = (html || '').trim();

  // ___widget_flashsale — custom MM flash sale widget
  if (trimmed.startsWith('___widget_flashsale')) {
    const pageSizeMatch = trimmed.match(/__pageSize\((\d+)\)/);
    const urlMatch = trimmed.match(/__url\("([^"]+)"\)/);
    const titleMatch = trimmed.match(/__title\("([^"]+)"\)/);
    return (
      <Suspense fallback={null}>
        <FlashsaleProductsCT
          pageSize={pageSizeMatch?.[1] ? parseInt(pageSizeMatch[1], 10) : 10}
          url={urlMatch?.[1] || '/flash-sale'}
          title={titleMatch?.[1]}
        />
      </Suspense>
    );
  }

  // ___widget_product_recommendation — custom MM product recommendation widget
  if (trimmed.startsWith('___widget_product_recommendation')) {
    const idMatch = trimmed.match(/__id\("([^"]+)"\)/);
    const limitMatch = trimmed.match(/__limit\((\d+)\)/);
    const colorMatch = trimmed.match(/__color\("([^"]+)"\)/);
    const imageMatch = trimmed.match(/__image\("([^"]+)"\)/);
    const imageMobileMatch = trimmed.match(/__image-mobile\("([^"]+)"\)/);
    return (
      <Suspense fallback={null}>
        <ProductRecommendationCT
          asmJourneyId={idMatch?.[1] || ''}
          pageSize={limitMatch?.[1] ? parseInt(limitMatch[1], 10) : 12}
          color={colorMatch?.[1]}
          image={imageMatch?.[1]}
          imageMobile={imageMobileMatch?.[1]}
        />
      </Suspense>
    );
  }

  // Sanitize HTML before rendering
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe', 'style'],
    ADD_ATTR: [
      'allow', 'allowfullscreen', 'frameborder', 'scrolling',
      'data-content-type', 'data-appearance', 'data-element',
      'data-pb-style', 'data-background-images', 'data-background-type',
      'data-show-button', 'data-show-overlay', 'data-slide-name',
      'data-autoplay', 'data-autoplay-speed', 'data-fade',
      'data-infinite-loop', 'data-show-arrows', 'data-show-dots',
      'data-enable-parallax', 'data-parallax-speed',
      'data-video-loop', 'data-video-play-only-visible',
      'data-video-fallback-src', 'data-video-lazy-load',
    ],
    FORCE_BODY: true,
  });

  return (
    <div
      className={`html-content ${cssClasses.join(' ')}`}
      style={dynamicStyles}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default Html;


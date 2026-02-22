import React from 'react';

interface ImageProps {
  desktopImage?: string;
  mobileImage?: string;
  altText?: string;
  title?: string;
  link?: string;
  openInNewTab?: boolean;
  caption?: string;
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
  /** Set true for above-fold images (e.g. hero banners) to boost LCP */
  priority?: boolean;
}

/**
 * Image ContentType component
 * Renders an image with optional link and caption
 */
export const Image: React.FC<ImageProps> = ({
  desktopImage,
  mobileImage,
  altText = '',
  title,
  link,
  openInNewTab = false,
  caption,
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
  priority = false,
}) => {
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
  const imageSrc = isMobile && mobileImage ? mobileImage : desktopImage;

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

  const ImageElement = (
    <img
      src={imageSrc}
      alt={altText}
      title={title}
      className="max-w-full h-auto"
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
    />
  );

  const ImageContent = (
    <div className={`image-content ${cssClasses.join(' ')}`} style={dynamicStyles}>
      {link ? (
        <a
          href={link}
          {...(openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {ImageElement}
        </a>
      ) : (
        ImageElement
      )}
      {caption && <div className="image-caption mt-2 text-sm text-gray-600">{caption}</div>}
    </div>
  );

  return ImageContent;
};

export default Image;

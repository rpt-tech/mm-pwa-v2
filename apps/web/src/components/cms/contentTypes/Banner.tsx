import React from 'react';

interface BannerProps {
  appearance?: 'poster' | 'collage-left' | 'collage-centered' | 'collage-right';
  minHeight?: string;
  backgroundColor?: string;
  desktopImage?: string;
  mobileImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundAttachment?: string;
  backgroundRepeat?: string;
  content?: string;
  showButton?: 'always' | 'hover' | 'never';
  buttonType?: 'primary' | 'secondary' | 'link';
  buttonText?: string;
  link?: string;
  openInNewTab?: boolean;
  showOverlay?: 'always' | 'hover' | 'never';
  overlayColor?: string;
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
 * Banner ContentType component
 * Renders a banner with background image, content, and optional button
 */
export const Banner: React.FC<BannerProps> = ({
  appearance = 'poster',
  minHeight,
  backgroundColor,
  desktopImage,
  mobileImage,
  backgroundSize = 'cover',
  backgroundPosition = 'center',
  backgroundAttachment = 'scroll',
  backgroundRepeat = 'no-repeat',
  content = '',
  showButton = 'never',
  buttonType = 'primary',
  buttonText,
  link,
  openInNewTab = false,
  showOverlay = 'never',
  overlayColor,
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
  const [hovered, setHovered] = React.useState(false);

  // Choose image based on screen size
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
  const image = isMobile && mobileImage ? mobileImage : desktopImage;

  const rootStyles: React.CSSProperties = {
    marginTop,
    marginRight,
    marginBottom,
    marginLeft
  };

  const wrapperStyles: React.CSSProperties = {
    backgroundColor,
    border,
    borderColor,
    borderWidth,
    borderRadius,
    textAlign: textAlign as any,
    minHeight: appearance !== 'poster' ? minHeight : undefined,
    paddingTop: appearance !== 'poster' ? paddingTop : undefined,
    paddingRight: appearance !== 'poster' ? paddingRight : undefined,
    paddingBottom: appearance !== 'poster' ? paddingBottom : undefined,
    paddingLeft: appearance !== 'poster' ? paddingLeft : undefined
  };

  if (image) {
    wrapperStyles.backgroundImage = `url(${image})`;
    wrapperStyles.backgroundSize = backgroundSize;
    wrapperStyles.backgroundPosition = backgroundPosition;
    wrapperStyles.backgroundAttachment = backgroundAttachment;
    wrapperStyles.backgroundRepeat = backgroundRepeat;
  }

  const overlayStyles: React.CSSProperties = {
    backgroundColor: showOverlay !== 'never' ? overlayColor : undefined,
    minHeight: appearance === 'poster' ? minHeight : undefined,
    paddingTop: appearance === 'poster' ? paddingTop : undefined,
    paddingRight: appearance === 'poster' ? paddingRight : undefined,
    paddingBottom: appearance === 'poster' ? paddingBottom : undefined,
    paddingLeft: appearance === 'poster' ? paddingLeft : undefined
  };

  const overlayClass = `banner-overlay banner-overlay-${appearance} ${
    showOverlay === 'hover' && !hovered ? 'opacity-0 hover:opacity-100' : ''
  }`;

  const buttonClass = showButton === 'hover' ? 'opacity-0 group-hover:opacity-100' : '';

  const BannerButton = showButton !== 'never' && buttonText ? (
    <div className={`mt-4 ${buttonClass} transition-opacity`}>
      <button
        className={`px-6 py-2 rounded ${
          buttonType === 'primary'
            ? 'bg-[#0272BA] text-white hover:bg-[#005a9e]'
            : buttonType === 'secondary'
            ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            : 'text-[#0272BA] hover:underline'
        }`}
        type="button"
      >
        {buttonText}
      </button>
    </div>
  ) : null;

  const BannerContent = (
    <div
      className={`banner-wrapper relative ${cssClasses.join(' ')}`}
      style={wrapperStyles}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={overlayClass} style={overlayStyles}>
        <div
          className="banner-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
        {BannerButton}
      </div>
    </div>
  );

  if (link) {
    return (
      <div className="banner-root group" style={rootStyles}>
        <a
          href={link}
          className="block"
          {...(openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {BannerContent}
        </a>
      </div>
    );
  }

  return (
    <div className="banner-root" style={rootStyles}>
      {BannerContent}
    </div>
  );
};

export default Banner;

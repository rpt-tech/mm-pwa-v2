import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface SliderProps {
  minHeight?: string;
  autoplay?: boolean;
  autoplaySpeed?: number;
  fade?: boolean;
  infinite?: boolean;
  showArrows?: boolean;
  showDots?: boolean;
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
 * Slider ContentType component
 * Carousel/slider for banners and other content
 */
export const SliderComponent: React.FC<SliderProps> = ({
  minHeight,
  autoplay = false,
  autoplaySpeed = 3000,
  fade = false,
  infinite = true,
  showArrows = true,
  showDots = true,
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
  const dynamicStyles: React.CSSProperties = {
    minHeight,
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

  const sliderSettings = {
    dots: showDots,
    arrows: showArrows,
    infinite,
    autoplay,
    autoplaySpeed,
    fade,
    slidesToShow: 1,
    slidesToScroll: 1,
    lazyLoad: 'ondemand' as const,
    swipeToSlide: true
  };

  return (
    <div className={`slider-root ${cssClasses.join(' ')}`} style={dynamicStyles}>
      <Slider {...sliderSettings}>{children}</Slider>
    </div>
  );
};

export default SliderComponent;

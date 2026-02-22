import React from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { useNavigate } from 'react-router-dom';

interface RichContentProps {
  html: string;
  className?: string;
}

/**
 * Process PageBuilder HTML:
 * 1. Decode HTML-entity-encoded content inside data-content-type="html" blocks
 * 2. Apply background images from data-background-images JSON attribute
 */
function processPageBuilderHtml(html: string): string {
  // 1. Decode entity-encoded HTML inside PageBuilder html blocks
  // e.g. &lt;div class="warning"&gt; → <div class="warning">
  let processed = html.replace(
    /(<div[^>]*data-content-type="html"[^>]*>)\s*(&lt;[\s\S]*?)(\s*<\/div>)/g,
    (_match, open, encoded, close) => {
      const decoded = encoded
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
      return open + decoded + close;
    }
  );

  // 2. Convert data-background-images JSON → inline background-image style
  // PageBuilder stores: data-background-images="{&quot;desktop_image&quot;:&quot;url&quot;}"
  processed = processed.replace(
    /data-background-images="(\{[^"]*\})"/g,
    (_match, raw) => {
      try {
        const decoded = raw
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&');
        const obj = JSON.parse(decoded);
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        const url = (isMobile && obj.mobile_image) ? obj.mobile_image : obj.desktop_image;
        if (url) {
          return `data-background-images="${raw}" style="background-image:url('${url}');background-size:cover;background-position:center;background-repeat:no-repeat;"`;
        }
      } catch { /* ignore */ }
      return `data-background-images="${raw}"`;
    }
  );

  return processed;
}

/**
 * RichContent component - renders sanitized HTML content
 * Handles internal link clicks for SPA navigation
 * Preserves PageBuilder <style> blocks and processes data attributes
 */
export const RichContent: React.FC<RichContentProps> = ({ html, className = '' }) => {
  const navigate = useNavigate();

  // Process PageBuilder-specific attributes before sanitizing
  const processedHtml = processPageBuilderHtml(html);

  // Sanitize HTML — allow <style> tags for PageBuilder inline CSS rules
  const sanitizedHtml = DOMPurify.sanitize(processedHtml, {
    ADD_TAGS: ['iframe', 'style'],
    ADD_ATTR: [
      'allow', 'allowfullscreen', 'frameborder', 'scrolling',
      // PageBuilder data attributes
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

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');

    if (anchor && anchor.href) {
      try {
        const url = new URL(anchor.href);
        const currentOrigin = window.location.origin;
        if (url.origin === currentOrigin) {
          e.preventDefault();
          navigate(url.pathname + url.search + url.hash);
        }
      } catch { /* ignore invalid URLs */ }
    }
  };

  return (
    <div
      className={`rich-content pagebuilder-content ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      onClick={handleClick}
    />
  );
};

export default RichContent;

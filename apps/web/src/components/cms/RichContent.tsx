import React from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { useNavigate } from 'react-router-dom';

interface RichContentProps {
  html: string;
  className?: string;
}

/**
 * RichContent component - renders sanitized HTML content
 * Handles internal link clicks for SPA navigation
 */
export const RichContent: React.FC<RichContentProps> = ({ html, className = '' }) => {
  const navigate = useNavigate();

  // Sanitize HTML to prevent XSS
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
  });

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');

    if (anchor && anchor.href) {
      const url = new URL(anchor.href);
      const currentOrigin = window.location.origin;

      // Handle internal links
      if (url.origin === currentOrigin) {
        e.preventDefault();
        const path = url.pathname + url.search + url.hash;
        navigate(path);
      }
    }
  };

  return (
    <div
      className={`rich-content prose max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      onClick={handleClick}
    />
  );
};

export default RichContent;

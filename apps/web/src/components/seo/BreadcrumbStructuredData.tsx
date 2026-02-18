import { useEffect } from 'react';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbStructuredDataProps {
  items: BreadcrumbItem[];
}

/**
 * BreadcrumbStructuredData component
 * Adds JSON-LD structured data for breadcrumbs
 */
export default function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  useEffect(() => {
    if (!items || items.length === 0) return;

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${window.location.origin}${item.url}`,
      })),
    };

    // Create or update script tag
    let script = document.getElementById('breadcrumb-structured-data') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = 'breadcrumb-structured-data';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);

    // Cleanup on unmount
    return () => {
      const existingScript = document.getElementById('breadcrumb-structured-data');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [items]);

  return null;
}

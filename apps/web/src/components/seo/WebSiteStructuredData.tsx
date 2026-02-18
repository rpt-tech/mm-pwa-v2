import { useEffect } from 'react';

/**
 * WebSiteStructuredData component
 * Adds JSON-LD structured data for the website
 * Enables Google search box in search results
 */
export default function WebSiteStructuredData() {
  useEffect(() => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'MM Mega Market Vietnam',
      url: window.location.origin,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${window.location.origin}/search?query={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    };

    // Create or update script tag
    let script = document.getElementById('website-structured-data') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = 'website-structured-data';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);

    // Cleanup on unmount
    return () => {
      const existingScript = document.getElementById('website-structured-data');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return null;
}

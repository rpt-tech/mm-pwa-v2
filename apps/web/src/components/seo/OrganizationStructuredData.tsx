import { useEffect } from 'react';

/**
 * OrganizationStructuredData component
 * Adds JSON-LD structured data for the organization
 * Should be added once in the main layout
 */
export default function OrganizationStructuredData() {
  useEffect(() => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'MM Mega Market Vietnam',
      url: window.location.origin,
      logo: `${window.location.origin}/images/logo.png`,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+84-1900-636-467',
        contactType: 'Customer Service',
        areaServed: 'VN',
        availableLanguage: ['Vietnamese', 'English'],
      },
      sameAs: [
        'https://www.facebook.com/mmvietnam',
        'https://www.youtube.com/mmvietnam',
      ],
    };

    // Create or update script tag
    let script = document.getElementById('organization-structured-data') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = 'organization-structured-data';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);

    // Cleanup on unmount
    return () => {
      const existingScript = document.getElementById('organization-structured-data');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return null;
}

import { Helmet } from 'react-helmet-async';

export default function HomeSchema() {
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://mm-pwa-v2.vercel.app';

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org/',
          '@type': 'WebSite',
          name: 'MM Mega Market Việt Nam',
          url: currentUrl,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${currentUrl}/search?query={search_term_string}`,
            'query-input': 'required name=search_query',
          },
        })}
      </script>
    </Helmet>
  );
}

import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  MAGENTO_URL: string;
  CACHE: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

// Cache TTL in seconds for public queries
const CACHE_TTL = 300; // 5 minutes

// Queries that are safe to cache (no auth, no mutations)
const CACHEABLE_OPERATIONS = [
  'GetMegaMenu',
  'GetStoreConfig',
  'GetCmsPage',
  'GetCmsBlocks',
  'GetProducts',
  'GetCategoryData',
  'GetFilterInputs',
  'GetFlashSaleProducts',
  'GetPopularKeywords',
  'GetBlogList',
  'GetBlogDetail',
  'GetBlogCategories',
  'GetArchivedBlog',
  'GetStoreLocators',
  'GetPopup',
];

function isCacheable(body: string, authHeader: string | undefined): boolean {
  if (authHeader) return false; // Never cache authenticated requests
  try {
    const parsed = JSON.parse(body);
    const operationName = parsed.operationName || '';
    return CACHEABLE_OPERATIONS.some((op) => operationName.startsWith(op));
  } catch {
    return false;
  }
}

app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Store'],
}));

// Health check
app.get('/health', (c) => c.json({
  status: 'ok',
  version: '1.0.0',
  timestamp: Date.now(),
  uptime: 'running',
  env: 'production',
}));

// GraphQL proxy to Magento with KV caching
app.post('/graphql', async (c) => {
  const body = await c.req.text();
  const auth = c.req.header('Authorization');
  const store = c.req.header('Store') || 'default';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (auth) headers['Authorization'] = auth;
  if (store) headers['Store'] = store;

  // Try cache for public queries
  if (c.env.CACHE && isCacheable(body, auth)) {
    const cacheKey = `gql:${store}:${btoa(body).slice(0, 200)}`;
    const cached = await c.env.CACHE.get(cacheKey);
    if (cached) {
      return new Response(cached, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'HIT',
        },
      });
    }

    const response = await fetch(c.env.MAGENTO_URL, {
      method: 'POST',
      headers,
      body,
    });

    const data = await response.text();

    // Only cache successful responses without errors
    if (response.ok) {
      try {
        const parsed = JSON.parse(data);
        if (!parsed.errors) {
          await c.env.CACHE.put(cacheKey, data, { expirationTtl: CACHE_TTL });
        }
      } catch {
        // ignore parse errors
      }
    }

    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'MISS',
      },
    });
  }

  // Pass-through for authenticated or non-cacheable requests
  const response = await fetch(c.env.MAGENTO_URL, {
    method: 'POST',
    headers,
    body,
  });

  const data = await response.text();
  return new Response(data, {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
  });
});

export default app;

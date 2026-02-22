import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  MAGENTO_URL: string;
  CACHE: KVNamespace;
  DEPLOY_VERSION?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Cache TTL in seconds for public queries
const CACHE_TTL = 300; // 5 minutes

// Build-time deploy version — injected via wrangler vars or defaults to timestamp
// This ensures every new deploy gets a fresh cache namespace automatically
const DEPLOY_VERSION = (globalThis as any).__DEPLOY_VERSION__ || Date.now().toString().slice(0, 8);

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

// Operations that deal with products / categories — longer CDN cache
const PRODUCT_CATEGORY_OPERATIONS = [
  'GetProducts',
  'GetCategoryData',
  'GetFilterInputs',
  'GetFlashSaleProducts',
  'GetPopularKeywords',
  'categoryList',
  'products',
  'GET_PRODUCTS',
  'GET_CATEGORY',
];

// Mutations / auth / cart — must never be cached
const NO_STORE_OPERATIONS = [
  'addProductsToCart',
  'removeItemFromCart',
  'updateCartItems',
  'placeOrder',
  'generateCustomerToken',
  'revokeCustomerToken',
  'createCustomer',
  'createEmptyCart',
  'mergeCarts',
  'setBillingAddressOnCart',
  'setShippingAddressesOnCart',
  'setShippingMethodsOnCart',
  'setPaymentMethodOnCart',
  'applyCouponToCart',
  'removeCouponFromCart',
  'changeCustomerPassword',
  'updateCustomer',
];

function getCacheControlHeader(body: string, authHeader: string | undefined): string {
  // Authenticated requests and mutations must never be stored
  if (authHeader) return 'no-store';
  try {
    const parsed = JSON.parse(body);
    const op: string = parsed.operationName || '';
    const query: string = parsed.query || '';

    // Check for no-store operations first (mutations take priority)
    if (NO_STORE_OPERATIONS.some((name) => op === name || query.includes(`mutation ${name}`))) {
      return 'no-store';
    }
    // Detect any mutation by keyword when operationName is absent
    if (!op && query.trimStart().startsWith('mutation')) {
      return 'no-store';
    }

    // Product / category queries get a longer CDN TTL
    if (PRODUCT_CATEGORY_OPERATIONS.some((name) => op.startsWith(name) || op === name)) {
      return 's-maxage=60, stale-while-revalidate=300';
    }

    // All other queries get a shorter TTL
    return 's-maxage=30, stale-while-revalidate=120';
  } catch {
    return 'no-store';
  }
}

function isCacheable(body: string, authHeader: string | undefined): boolean {
  if (authHeader) return false;
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

// Health check — exposes deploy version so we can verify cache busting
app.get('/health', (c) => c.json({
  status: 'ok',
  version: '1.0.0',
  deployVersion: c.env.DEPLOY_VERSION || DEPLOY_VERSION,
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
    // Include deploy version in cache key — new deploy = new keys, old entries expire naturally
    const deployVer = c.env.DEPLOY_VERSION || DEPLOY_VERSION;
    const cacheKey = `gql:v${deployVer}:${store}:${btoa(body).slice(0, 180)}`;

    const cached = await c.env.CACHE.get(cacheKey);
    if (cached) {
      return new Response(cached, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': getCacheControlHeader(body, auth),
          'X-Cache': 'HIT',
          'X-Cache-Version': deployVer,
        },
      });
    }

    const response = await fetch(c.env.MAGENTO_URL, {
      method: 'POST',
      headers,
      body,
    });

    const data = await response.text();

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
        'Cache-Control': getCacheControlHeader(body, auth),
        'X-Cache': 'MISS',
        'X-Cache-Version': deployVer,
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
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': getCacheControlHeader(body, auth),
    },
  });
});

export default app;

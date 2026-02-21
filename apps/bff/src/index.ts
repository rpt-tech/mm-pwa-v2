import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  MAGENTO_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

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

// GraphQL proxy to Magento
app.post('/graphql', async (c) => {
  const body = await c.req.text();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const auth = c.req.header('Authorization');
  if (auth) headers['Authorization'] = auth;

  const store = c.req.header('Store');
  if (store) headers['Store'] = store;

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

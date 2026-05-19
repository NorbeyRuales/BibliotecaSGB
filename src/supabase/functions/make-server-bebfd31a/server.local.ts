import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createClient } from '@supabase/supabase-js';
import * as kv from './kv_store.node';
import { registerRoutes } from './logic';

const FUNCTION_BASE_PATH = '/make-server-bebfd31a';

const app = new Hono();
const api = new Hono();
app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

registerRoutes(api, supabase, kv);

app.route('/', api);
app.route(FUNCTION_BASE_PATH, api);

import http from 'node:http';

const port = parseInt(process.env.PORT || '8787', 10);
const server = http.createServer((req, res) => {
  app.handle(req, res).catch((err: any) => {
    console.error('Request handling error:', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  });
});

server.listen(port, () => {
  console.log(`Local functions server running on http://localhost:${port}`);
});

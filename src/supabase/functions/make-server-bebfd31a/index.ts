import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';
import { registerRoutes } from './logic.ts';

const FUNCTION_BASE_PATH = '/make-server-bebfd31a';

const app = new Hono();
const api = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

registerRoutes(api, supabase, kv);

// Supabase puede reenviar la ruta con o sin el slug de la función.
app.route('/', api);
app.route(FUNCTION_BASE_PATH, api);

Deno.serve(app.fetch);

import { projectId as fallbackProjectId, publicAnonKey as fallbackAnonKey } from './info';

const env = import.meta.env;

const fallbackSupabaseUrl = `https://${fallbackProjectId}.supabase.co`;

const supabaseUrl = (env.VITE_SUPABASE_URL ?? fallbackSupabaseUrl).trim();
const supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY ?? fallbackAnonKey).trim();
const functionName = (env.VITE_SUPABASE_FUNCTION_NAME ?? 'make-server-bebfd31a').trim();
const functionsUrl = (env.VITE_SUPABASE_FUNCTIONS_URL ?? `${supabaseUrl}/functions/v1/${functionName}`).trim();

export const supabaseConfig = {
  supabaseUrl,
  supabaseAnonKey,
  functionName,
  functionsUrl,
};

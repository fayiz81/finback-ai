import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env variables');
}

// Singleton guard — prevents "Multiple GoTrueClient instances" warning
// that occurs with React HMR or multiple module evaluations.
const globalKey = '__finback_supabase__';
declare global { interface Window { [globalKey]?: SupabaseClient } }

function getClient(): SupabaseClient {
  if (typeof window !== 'undefined' && window[globalKey]) {
    return window[globalKey]!;
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      // Unique storage key prevents conflicts if multiple apps share the domain
      storageKey: 'finback-ai-auth',
    },
    global: {
      headers: { 'x-client-info': 'finback-ai/2.0' },
      fetch: (url, options = {}) => {
        const isUpload =
          (options.method === 'POST' && options.body instanceof Blob) ||
          options.body instanceof File ||
          options.body instanceof FormData ||
          !!(options.body && (options.body as any).size > 60000);
        return fetch(url, { ...options, keepalive: !isUpload });
      },
    },
    realtime: { params: { eventsPerSecond: 10 } },
    db: { schema: 'public' },
  });

  if (typeof window !== 'undefined') {
    window[globalKey] = client;
  }

  return client;
}

export const supabase = getClient();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist session in localStorage so returning users are authenticated
    // immediately without any network call on load.
    persistSession: true,
    // Auto-refresh the JWT 60 seconds before it expires — prevents mid-session
    // 401s without requiring the user to log in again.
    autoRefreshToken: true,
    // Detect and broadcast sign-in/out events across browser tabs.
    detectSessionInUrl: true,
    // Use PKCE flow for better security (prevents auth code interception).
    flowType: 'pkce',
  },
  global: {
    headers: {
      // Identify requests for better Supabase dashboard analytics.
      'x-client-info': 'finback-ai/1.0',
    },
    // Only use keepalive for non-upload requests (keepalive has 64KB limit)
    fetch: (url, options = {}) => {
      const isUpload = options.method === 'POST' && options.body instanceof Blob ||
                       options.body instanceof File ||
                       options.body instanceof FormData ||
                       (options.body && (options.body as any).size > 60000);
      return fetch(url, { ...options, keepalive: isUpload ? false : true });
    },
  },
  realtime: {
    // Increase heartbeat interval to reduce wasted connections when the tab
    // is idle — helps with connection limits under high concurrent load.
    params: { eventsPerSecond: 10 },
  },
  db: {
    // Always use the public schema.
    schema: 'public',
  },
});

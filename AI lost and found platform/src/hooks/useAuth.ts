import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const ADMIN_EMAILS = ['fayisu8129410200@gmail.com'];

// ── Session cache key ─────────────────────────────────────────────────────────
// We store the user object in sessionStorage so the UI renders immediately
// on page load without waiting for a network round-trip to Supabase.
const CACHE_KEY = 'finback_user_cache';

function readCache(): any | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { user, exp } = JSON.parse(raw);
    if (Date.now() > exp) { sessionStorage.removeItem(CACHE_KEY); return null; }
    return user;
  } catch { return null; }
}

function writeCache(user: any | null) {
  try {
    if (!user) { sessionStorage.removeItem(CACHE_KEY); return; }
    // Cache for 55 minutes (Supabase JWT lifespan is 60 min)
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ user, exp: Date.now() + 55 * 60 * 1000 }));
  } catch {}
}

// ── Retry with exponential back-off ──────────────────────────────────────────
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 400): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try { return await fn(); }
    catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, delay * 2 ** i));
    }
  }
  throw new Error('unreachable');
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth() {
  // Seed state from cache so the UI is never blank while the network call flies
  const [user, setUser] = useState<any>(() => readCache());
  const [loading, setLoading] = useState<boolean>(() => readCache() === null);
  const mounted = useRef(true);

  // Stable updater — keeps cache in sync
  const updateUser = useCallback((u: any | null) => {
    if (!mounted.current) return;
    writeCache(u);
    setUser(u);
    setLoading(false);
  }, []);

  useEffect(() => {
    mounted.current = true;

    // 1. If we have a cached user, we don't block the UI — still refresh in bg
    const cached = readCache();
    if (!cached) setLoading(true);

    // 2. Fetch real session (Supabase reads from localStorage first, so this is
    //    almost always instant on the same device; only the first-ever load hits
    //    the network).
    supabase.auth.getSession().then(({ data }) => {
      updateUser(data.session?.user ?? null);
    });

    // 3. Listen for sign-in / sign-out / token refresh events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      updateUser(session?.user ?? null);
    });

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, [updateUser]);

  // ── Sign in — with retry + optimistic loading state ────────────────────────
  const signIn = useCallback(async (email: string, password: string) => {
    const result = await withRetry(() =>
      supabase.auth.signInWithPassword({ email, password })
    );
    // onAuthStateChange will call updateUser, but we also update immediately
    // so the redirect doesn't wait for the event to fire.
    if (result.data?.user) updateUser(result.data.user);
    return result;
  }, [updateUser]);

  // ── Sign up ────────────────────────────────────────────────────────────────
  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const result = await withRetry(() =>
      supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
    );
    return result;
  }, []);

  // ── Google OAuth ────────────────────────────────────────────────────────────
  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${window.location.pathname}#/dashboard`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    return { error };
  }, []);

  // ── Sign out — clears cache immediately ────────────────────────────────────
  const signOut = useCallback(async () => {
    writeCache(null);
    setUser(null);
    await supabase.auth.signOut();
  }, []);

  const isAdmin = useCallback(() => {
    if (!user) return false;
    return ADMIN_EMAILS.includes(user.email);
  }, [user]);

  return {
    user,
    loading,
    isLoading: loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    isAdmin,
  };
}

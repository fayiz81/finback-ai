import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Add your email here to be recognized as admin
const ADMIN_EMAILS = ['fayisu8129410200@gmail.com'];

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password });

  const signUp = (email: string, password: string, fullName: string) =>
    supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });

  const signOut = () => supabase.auth.signOut();

  const isAdmin = () => {
    if (!user) return false;
    return ADMIN_EMAILS.includes(user.email);
  };

  const isAuthenticated = !!user;
  const isLoading = loading;

  return {
    user,
    loading,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    isAdmin,
  };
}

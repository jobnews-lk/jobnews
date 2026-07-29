import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/supabase';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' });
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch(() => {
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        try {
          if (session?.user) {
            setUser({ id: session.user.id, email: session.user.email || '' });
            await loadProfile(session.user.id);
          } else {
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
        } catch {
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    try {
      for (let i = 0; i < 5; i++) {
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
        if (data) {
          setProfile(data as Profile);
          setLoading(false);
          return;
        }
        await new Promise((r) => setTimeout(r, 300));
      }
    } catch {
      // network error — fall through
    }
    setProfile(null);
    setLoading(false);
  }

  function normalizeError(err: unknown): Error {
    if (err instanceof Error) {
      if (err.message === 'Failed to fetch' || err.message.includes('fetch')) {
        return new Error('Network error. Please check your connection and try again.');
      }
      return err;
    }
    return new Error('An unexpected error occurred');
  }

  async function signIn(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ? normalizeError(error) : null };
    } catch (err) {
      return { error: normalizeError(err) };
    }
  }

  async function signUp(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: normalizeError(error) };
      if (!data.user) return { error: new Error('An account with this email already exists. Please sign in instead.') };
      return { error: null };
    } catch (err) {
      return { error: normalizeError(err) };
    }
  }

  async function resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });
      return { error: error ? normalizeError(error) : null };
    } catch (err) {
      return { error: normalizeError(err) };
    }
  }

  async function updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      return { error: error ? normalizeError(error) : null };
    } catch (err) {
      return { error: normalizeError(err) };
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAdmin: profile?.role === 'admin',
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

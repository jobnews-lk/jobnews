import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [hasAdmin, setHasAdmin] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      setCheckingAdmin(false);
      return;
    }
    async function check() {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');
      setHasAdmin((count ?? 0) > 0);
      setCheckingAdmin(false);
    }
    check();
  }, [authLoading, user]);

  if (authLoading || checkingAdmin) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (user) {
    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  }

  return <Navigate to="/admin" replace />;
}

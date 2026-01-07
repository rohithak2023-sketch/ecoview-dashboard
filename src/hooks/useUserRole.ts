import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'admin' | 'user';

interface UseUserRoleResult {
  role: AppRole | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useUserRole = (): UseUserRoleResult => {
  const { user, isLoading: authLoading } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      if (authLoading) return;
      
      if (!user) {
        setRole(null);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (roleError) {
          console.error('Error fetching role:', roleError);
          setError(roleError.message);
          setRole(null);
        } else {
          setRole(data?.role as AppRole);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Failed to fetch user role');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();
  }, [user, authLoading]);

  return {
    role,
    isAdmin: role === 'admin',
    isLoading: isLoading || authLoading,
    error,
  };
};

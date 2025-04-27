
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import getUUIDFromClerkID from '@/utils/getUUIDFromClerkID';

export const useClerkSupabaseAuth = () => {
  const { userId, getToken } = useAuth();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const syncAuthState = async () => {
      if (!userId) {
        setAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Get Supabase UUID from Clerk ID
        const supabaseUserId = getUUIDFromClerkID(userId);
        
        // Get JWT token from Clerk using the Supabase template
        const token = await getToken({ template: "supabase" });
        
        if (!token) {
          throw new Error("Failed to get authentication token");
        }
        
        // Set the JWT on the Supabase client
        const { error: authError } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: token,
        });
        
        if (authError) {
          throw authError;
        }
        
        // Verify the session worked by checking user
        const { data, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw userError;
        }
        
        setAuthenticated(!!data.user);
      } catch (err) {
        console.error('Error syncing auth state:', err);
        setError(err instanceof Error ? err : new Error('Authentication error'));
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    syncAuthState();
  }, [userId, getToken]);

  return { authenticated, loading, error };
};


import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import getUUIDFromClerkID from '@/utils/getUUIDFromClerkID';

export const useClerkSupabaseAuth = () => {
  const { userId } = useAuth();
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
        
        // Check if we have an active session
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session) {
          console.log('No Supabase session found, signing in anonymously');
          
          // No session, try to sign in anonymously
          await supabase.auth.signInAnonymously();
          
          // Verify if sign in was successful
          const { data: verifyData } = await supabase.auth.getSession();
          setAuthenticated(!!verifyData.session);
        } else {
          // We have a session
          setAuthenticated(true);
        }
      } catch (err) {
        console.error('Error syncing auth state:', err);
        setError(err instanceof Error ? err : new Error('Authentication error'));
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    syncAuthState();
  }, [userId]);

  return { authenticated, loading, error };
};

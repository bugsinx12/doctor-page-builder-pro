
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';

/**
 * Custom hook to get a Supabase client authenticated with a Clerk JWT
 */
export function useClerkSupabaseClient() {
  const { getToken, userId, isSignedIn } = useAuth();
  const [client, setClient] = useState<SupabaseClient<Database> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const setupSupabase = async () => {
      if (!isSignedIn || !userId) {
        setClient(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Get token from Clerk using the supabase template
        const token = await getToken({ template: 'supabase' });
        
        if (!token) {
          console.error('Failed to get Clerk JWT token for Supabase');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Create a Supabase client with the token
        const supabase = createClient<Database>(
          SUPABASE_URL,
          SUPABASE_PUBLISHABLE_KEY,
          {
            global: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
            auth: {
              persistSession: false,
              autoRefreshToken: false,
            },
          }
        );

        setClient(supabase);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error setting up Supabase client:', error);
        setClient(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    setupSupabase();
  }, [getToken, userId, isSignedIn]);

  return { client, isLoading, isAuthenticated, userId };
}

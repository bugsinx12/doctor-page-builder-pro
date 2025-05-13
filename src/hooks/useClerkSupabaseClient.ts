
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
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const setupSupabase = async () => {
      if (!isSignedIn || !userId) {
        setClient(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        setError(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get token from Clerk using the supabase template
        const token = await getToken({ template: 'supabase' });
        
        if (!token) {
          console.error('Failed to get Clerk JWT token for Supabase');
          setIsAuthenticated(false);
          setClient(null);
          setIsLoading(false);
          setError(new Error('Failed to get authentication token'));
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

        // Test that we can access the database with this client
        try {
          const { error: testError } = await supabase
            .from('profiles')
            .select('id')
            .limit(1);
          
          if (testError && !testError.message.includes('no rows found')) {
            console.error('Authentication test failed:', testError);
            throw new Error(`Authentication test failed: ${testError.message}`);
          }
          
          // Authentication successful
          setClient(supabase);
          setIsAuthenticated(true);
        } catch (testErr) {
          console.error('Error testing authentication:', testErr);
          setClient(null);
          setIsAuthenticated(false);
          setError(testErr instanceof Error ? testErr : new Error('Authentication test failed'));
        }
      } catch (error) {
        console.error('Error setting up Supabase client:', error);
        setClient(null);
        setIsAuthenticated(false);
        setError(error instanceof Error ? error : new Error('Failed to set up Supabase client'));
      } finally {
        setIsLoading(false);
      }
    };

    setupSupabase();
  }, [getToken, userId, isSignedIn]);

  return { client, isLoading, isAuthenticated, userId, error };
}

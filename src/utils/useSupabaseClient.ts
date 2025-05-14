
import { useState, useEffect, useCallback } from 'react';
import { useAuth, useSession } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';

/**
 * Custom hook to get a Supabase client authenticated with a Clerk JWT
 */
export function useSupabaseClient() {
  const { userId } = useAuth();
  const { session } = useSession();
  const [client, setClient] = useState<SupabaseClient<Database> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Function to get a fresh token from Clerk
  const getToken = useCallback(async () => {
    try {
      if (!session) return null;
      return await session.getToken({ template: "supabase" });
    } catch (error) {
      console.error("Error getting Clerk token for Supabase:", error);
      return null;
    }
  }, [session]);

  useEffect(() => {
    const setupSupabase = async () => {
      if (!userId || !session) {
        setClient(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get token from Clerk using the supabase template
        const token = await getToken();
        
        if (!token) {
          console.error('Failed to get Clerk JWT token for Supabase');
          setIsAuthenticated(false);
          setClient(null);
          setError(new Error('Failed to get authentication token'));
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

        // Test authentication with a simple query
        try {
          const { error: testError } = await supabase
            .from('profiles')
            .select('id')
            .limit(1);
          
          if (testError && !testError.message.includes('no rows found') && !testError.message.includes('No rows found')) {
            console.error('Authentication test failed:', testError);
            setClient(null);
            setIsAuthenticated(false);
            setError(new Error(`Authentication test failed: ${testError.message}`));
            toast({
              title: "Authentication Error",
              description: "Unable to verify Supabase connection with Clerk token.",
              variant: "destructive",
            });
          } else {
            // Authentication successful
            setClient(supabase);
            setIsAuthenticated(true);
            setError(null);
          }
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
  }, [userId, session, getToken, toast]);

  return { 
    client, 
    isLoading, 
    isAuthenticated, 
    error,
    refreshClient: getToken, // Expose function to manually refresh the token if needed
  };
}

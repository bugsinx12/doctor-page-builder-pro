
import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@clerk/clerk-react';
import { createSupabaseClientWithClerk } from '@/integrations/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook that provides an authenticated Supabase client using Clerk's JWT
 * This is the preferred way to access Supabase in components
 */
export function useSupabaseClient() {
  const { session, isSignedIn } = useSession();
  const [client, setClient] = useState<SupabaseClient<Database> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Create token getter function that will be passed to Supabase client
  const getToken = useCallback(async () => {
    if (!session) return null;
    try {
      // Get the JWT token using the supabase template
      return await session.getToken({ template: 'supabase' });
    } catch (error) {
      console.error('Error getting Clerk JWT token for Supabase:', error);
      return null;
    }
  }, [session]);

  // Initialize and test the client
  useEffect(() => {
    const initClient = async () => {
      try {
        setIsLoading(true);

        if (!isSignedIn || !session) {
          setClient(null);
          setError(null);
          setIsLoading(false);
          return;
        }

        // Create authenticated client
        const supabaseClient = createSupabaseClientWithClerk(getToken);
        setClient(supabaseClient);

        // Test authentication with a simple query
        const { error: testError } = await supabaseClient
          .from('profiles')
          .select('id')
          .limit(1);

        if (testError && !testError.message.includes('no rows found')) {
          throw new Error(`Supabase authentication test failed: ${testError.message}`);
        }

        setError(null);
      } catch (err) {
        console.error('Supabase client initialization error:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize Supabase client'));
        
        toast({
          title: 'Authentication Error',
          description: 'Failed to connect to the database. Please try signing out and back in.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    initClient();
  }, [session, isSignedIn, getToken, toast]);

  return { 
    client, 
    isLoading, 
    error,
    isAuthenticated: !!client && !error 
  };
}

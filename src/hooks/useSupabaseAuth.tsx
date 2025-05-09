
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { getSupabaseWithClerkToken, supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

/**
 * Hook to get a Supabase client authenticated with Clerk's JWT
 */
export function useSupabaseAuth() {
  const { getToken, userId, isSignedIn } = useAuth();
  const [client, setClient] = useState(supabase);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const setupSupabaseAuth = async () => {
      if (!isSignedIn) {
        if (isMounted) {
          setClient(supabase);
          setIsAuthenticated(false);
          setIsLoading(false);
          setError(null);
        }
        return;
      }

      try {
        setIsLoading(true);
        // Get JWT using the "supabase" template
        const token = await getToken({ template: "supabase" });
        
        if (!token) {
          throw new Error("Failed to get Supabase JWT from Clerk");
        }

        // Create authenticated client
        const authenticatedClient = getSupabaseWithClerkToken(token);
        
        // Test authentication with a simple query
        const { error: testError } = await authenticatedClient
          .from('profiles')
          .select('id')
          .limit(1);
          
        if (testError && !testError.message.includes('No rows found')) {
          throw testError;
        }

        if (isMounted) {
          setClient(authenticatedClient);
          setIsAuthenticated(true);
          setError(null);
        }
      } catch (err) {
        console.error("Error setting up Supabase client:", err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Failed to authenticate with Supabase"));
          setIsAuthenticated(false);
          toast({
            title: "Authentication Error",
            description: "Could not connect to the database. Please check your JWT template configuration in Clerk.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    setupSupabaseAuth();

    return () => {
      isMounted = false;
    };
  }, [getToken, isSignedIn, toast]);

  return {
    client,
    isLoading,
    error,
    isAuthenticated,
    userId
  };
}

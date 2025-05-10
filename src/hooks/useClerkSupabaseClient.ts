
import { useState, useEffect } from 'react';
import { useSession } from '@clerk/clerk-react';
import { createSupabaseClientWithClerk, supabase } from '@/integrations/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook that provides a Supabase client authenticated with the Clerk session
 * @deprecated Use useAuthenticatedSupabase instead for simpler and more reliable auth
 */
export function useClerkSupabaseClient() {
  const { session, isSignedIn } = useSession();
  const [client, setClient] = useState<SupabaseClient<Database> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isSignedIn || !session) {
      setIsLoading(false);
      setIsAuthenticated(false);
      setClient(null);
      return;
    }

    try {
      // Create a token getter function
      const getToken = async () => {
        try {
          // Get a token with the Supabase template
          return await session.getToken({ template: "supabase" }) ?? null;
        } catch (error) {
          console.error("Failed to get Clerk token:", error);
          return null;
        }
      };

      // Create client with the token getter
      const supabaseClient = createSupabaseClientWithClerk(getToken);
      
      // Set the client correctly with proper type casting
      setClient(supabaseClient as unknown as SupabaseClient<Database>);

      // Verify that authentication works
      const verifyAuth = async () => {
        try {
          setIsLoading(true);
          
          // Test a simple query - just to verify auth works
          const { data, error: queryError } = await supabaseClient.from('profiles').select('id').limit(1);
          
          if (queryError) {
            console.error("Supabase authentication verification failed:", queryError);
            setError(new Error(`Authentication failed: ${queryError.message}`));
            setIsAuthenticated(false);
            toast({
              title: "Authentication Error",
              description: "Failed to authenticate with Supabase. Please check your Clerk-Supabase integration.",
              variant: "destructive",
            });
          } else {
            setError(null);
            setIsAuthenticated(true);
          }
        } catch (err) {
          console.error("Error verifying authentication:", err);
          setError(err instanceof Error ? err : new Error("Failed to verify authentication"));
          setIsAuthenticated(false);
          toast({
            title: "Authentication Error",
            description: "An unexpected error occurred while verifying authentication.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      verifyAuth();
    } catch (err) {
      console.error("Error initializing Supabase client:", err);
      setError(err instanceof Error ? err : new Error("Failed to initialize Supabase client"));
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, [isSignedIn, session, toast]);

  return {
    client,
    isLoading,
    error,
    isAuthenticated,
    userId: session?.user?.id || null
  };
}

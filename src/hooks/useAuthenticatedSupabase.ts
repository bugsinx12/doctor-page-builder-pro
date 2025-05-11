
import { useState, useEffect } from 'react';
import { useSession, useAuth } from '@clerk/clerk-react';
import { createSupabaseClientWithClerk, supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { SupabaseClient } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to get a Supabase client authenticated with Clerk's session token
 * This is the primary authentication hook for Supabase with Clerk TPA
 */
export function useAuthenticatedSupabase() {
  const { session, isSignedIn } = useSession();
  const { userId } = useAuth();
  const [client, setClient] = useState<SupabaseClient<Database> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  // Set up the client and verify authentication
  useEffect(() => {
    if (!isSignedIn || !session || !userId) {
      setIsAuthenticated(false);
      setClient(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    // Create a token getter function
    const getToken = async () => {
      if (!session) return null;
      try {
        // Get the token using the Supabase template
        return await session.getToken({ template: "supabase" }) ?? null;
      } catch (error) {
        console.error("Failed to get Clerk token:", error);
        return null;
      }
    };

    // Create the client with the token getter
    const supabaseClient = createSupabaseClientWithClerk(getToken);
    
    // Set the client
    setClient(supabaseClient as unknown as SupabaseClient<Database>);

    // Test authentication with a simple query
    const testAuth = async () => {
      try {
        setIsLoading(true);
        
        // Try to access a protected resource to verify auth works
        const { error: queryError } = await supabaseClient
          .from('profiles')
          .select('id')
          .limit(1)
          .single();
        
        if (queryError && !queryError.message.includes('No rows found')) {
          console.error("Supabase authentication verification failed:", queryError);
          setError(new Error(`Authentication failed: ${queryError.message}`));
          setIsAuthenticated(false);
          
          if (queryError.code === 'PGRST301') {
            toast({
              title: "Authentication Error",
              description: "Database access denied. Please ensure your Clerk-Supabase integration is properly configured.",
              variant: "destructive",
            });
          }
        } else {
          // Authentication successful
          setIsAuthenticated(true);
          setError(null);
        }
      } catch (err) {
        console.error("Error verifying authentication:", err);
        setError(err instanceof Error ? err : new Error("Failed to verify authentication"));
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    testAuth();
    
    // No cleanup needed for the client itself as it's stateless
  }, [isSignedIn, session, userId, toast]);

  return {
    client,
    isLoading,
    error,
    isAuthenticated,
    userId
  };
}

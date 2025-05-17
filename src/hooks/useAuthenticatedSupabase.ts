
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { SupabaseClient } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to get an authenticated Supabase client
 * This is the primary authentication hook for Supabase
 */
export function useAuthenticatedSupabase() {
  const { session, user } = useAuth();
  const [client, setClient] = useState<SupabaseClient<Database> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  // Set up the client and verify authentication
  useEffect(() => {
    if (!user || !session) {
      setIsAuthenticated(false);
      setClient(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    // Use the standard supabase client that is already authenticated
    setClient(supabase);
    
    // Test authentication with a simple query
    const testAuth = async () => {
      try {
        setIsLoading(true);
        
        // Try to access a protected resource to verify auth works
        const { error: queryError } = await supabase
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
              description: "Database access denied. Please ensure your authentication is properly configured.",
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
  }, [user, session, toast]);

  return {
    client,
    isLoading,
    error,
    isAuthenticated,
    userId: user?.id
  };
}


import { useState, useCallback, useEffect } from 'react';
import { useSession } from '@clerk/clerk-react';
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to check if the user is authenticated with Supabase via Clerk JWT
 */
export function useSupabaseAuth() {
  const { session, isSignedIn } = useSession();
  const userId = session?.user?.id || null;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Function to check authentication that can be called on demand
  const checkAuth = useCallback(async () => {
    if (!userId || !isSignedIn) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get token from Clerk with custom claims
      const token = await session?.getToken({
        template: "supabase"
      });
      
      if (!token) {
        const noTokenError = new Error("No authentication token available");
        setError(noTokenError);
        toast({
          title: "Authentication Error",
          description: "Failed to get authentication token from Clerk. Please check JWT template configuration.",
          variant: "destructive",
        });
        setIsAuthenticated(false);
        setIsLoading(false);
        return false;
      }

      // Test our authentication with a direct API call using the token
      try {
        // Use text format for the Clerk ID in the request
        const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`, {
          headers: {
            'apikey': SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          console.error("Supabase auth error:", response.statusText);
          setError(new Error(`Authentication failed: ${response.statusText}`));
          
          // Log more details for debugging
          const errorText = await response.text();
          console.error("Auth error details:", errorText);
          
          toast({
            title: "Authentication Error",
            description: "Failed to authenticate with Supabase. Check your JWT template configuration.",
            variant: "destructive",
          });
          setIsAuthenticated(false);
          setIsLoading(false);
          return false;
        }
      } catch (err) {
        console.error("Error testing auth:", err);
        throw err;
      }

      // Authentication successful
      setIsAuthenticated(true);
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error("Error in Supabase auth:", err);
      setError(err instanceof Error ? err : new Error("Authentication error"));
      setIsAuthenticated(false);
      toast({
        title: "Authentication Error",
        description: "Please ensure your Clerk JWT template is configured correctly.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId, session, toast, isSignedIn]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { 
    isAuthenticated, 
    isLoading, 
    error, 
    refreshAuth: checkAuth,
    userId, // Add userId here for components that need it
    authAttempted: !isLoading // If we're not loading, we've attempted auth
  };
}

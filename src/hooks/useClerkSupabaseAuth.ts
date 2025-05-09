
import { useState, useEffect } from 'react';
import { useSession } from '@clerk/clerk-react';
import { useToast } from '@/hooks/use-toast';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';

/**
 * Hook to check if the user is authenticated with Supabase via Clerk TPA
 * This is used for auth verification without requiring a full Supabase client
 */
export function useClerkSupabaseAuth() {
  const { isSignedIn, session } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [authAttempted, setAuthAttempted] = useState(false);
  const { toast } = useToast();
  const userId = session?.user.id || null;

  useEffect(() => {
    const checkAuth = async () => {
      if (!isSignedIn || !session) {
        setIsAuthenticated(false);
        setIsLoading(false);
        setAuthAttempted(true);
        return;
      }

      try {
        setIsLoading(true);
        
        // Get a default token from Clerk without specifying a template
        const token = await session.getToken();
        
        if (!token) {
          setIsAuthenticated(false);
          setError(new Error("No authentication token available"));
          console.error("No authentication token available from Clerk");
          setIsLoading(false);
          setAuthAttempted(true);
          return;
        }
        
        // Verify token works with a direct API call to Supabase
        try {
          const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`, {
            headers: {
              'apikey': SUPABASE_PUBLISHABLE_KEY,
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Supabase auth error: ${response.status} - ${errorText}`);
          }
          
          // Authentication successful
          setIsAuthenticated(true);
          setError(null);
        } catch (fetchError) {
          console.error("Error verifying Supabase auth:", fetchError);
          setIsAuthenticated(false);
          setError(fetchError instanceof Error ? fetchError : new Error("Failed to verify authentication"));
        }
      } catch (err) {
        console.error("Authentication error:", err);
        setIsAuthenticated(false);
        setError(err instanceof Error ? err : new Error("Authentication failed"));
      } finally {
        setIsLoading(false);
        setAuthAttempted(true);
      }
    };
    
    checkAuth();
  }, [isSignedIn, session, toast]);
  
  const refreshAuth = async () => {
    setIsLoading(true);
    try {
      if (!session) {
        setIsAuthenticated(false);
        setError(new Error("No session available"));
        return;
      }
      
      // Get a fresh token and verify it works
      const token = await session.getToken();
      
      if (!token) {
        setIsAuthenticated(false);
        setError(new Error("Failed to get authentication token"));
        return;
      }
      
      // Test that the token works with Supabase
      const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`, {
        headers: {
          'apikey': SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setIsAuthenticated(true);
        setError(null);
        
        toast({
          title: "Authentication Refreshed",
          description: "Your authentication status has been updated.",
        });
      } else {
        const errorText = await response.text();
        throw new Error(`Auth verification failed: ${response.status} - ${errorText}`);
      }
    } catch (err) {
      console.error("Error refreshing authentication:", err);
      setIsAuthenticated(false);
      setError(err instanceof Error ? err : new Error("Failed to refresh authentication"));
      
      toast({
        title: "Authentication Failed",
        description: "Could not refresh your authentication status.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setAuthAttempted(true);
    }
  };
  
  return { 
    isAuthenticated, 
    isLoading, 
    error, 
    refreshAuth, 
    userId, 
    authAttempted 
  };
}

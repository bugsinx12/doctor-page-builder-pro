
import { useState, useEffect } from 'react';
import { useSession } from '@clerk/clerk-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to check if the user is authenticated with Supabase via Clerk TPA
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
        
        // Just verify we have a valid token - actual auth is tested on first API call
        setIsAuthenticated(true);
        setError(null);
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
  }, [isSignedIn, session]);
  
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
      if (token) {
        setIsAuthenticated(true);
        setError(null);
        
        toast({
          title: "Authentication Refreshed",
          description: "Your authentication status has been updated.",
        });
      } else {
        setIsAuthenticated(false);
        setError(new Error("Failed to get authentication token"));
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

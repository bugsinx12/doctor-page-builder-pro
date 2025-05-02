
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook that manages Clerk authentication state and token retrieval
 */
export const useClerkAuth = () => {
  const { userId, getToken, isSignedIn } = useAuth();
  const [clerkToken, setClerkToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Function to get a fresh token from Clerk
  const fetchClerkToken = useCallback(async () => {
    if (!userId || !isSignedIn) {
      console.log("User not signed in or no user ID available");
      setClerkToken(null);
      setIsLoading(false);
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching Clerk token for Supabase TPA...");
      
      // Get token for TPA - use the 'supabase' template if configured
      const token = await getToken({ template: "__session" });
      
      if (!token) {
        const noTokenError = new Error("Failed to get authentication token");
        console.error("No Clerk token available:", noTokenError);
        setError(noTokenError);
        toast({
          title: "Authentication Error",
          description: "Failed to get authentication token from Clerk. Make sure Third-Party Authentication is enabled for Supabase in your Clerk dashboard.",
          variant: "destructive",
        });
        setClerkToken(null);
        setIsLoading(false);
        return null;
      }
      
      console.log("Successfully retrieved Clerk token for Supabase");
      setClerkToken(token);
      setIsLoading(false);
      return token;
    } catch (err) {
      console.error("Error getting Clerk token:", err);
      setError(err instanceof Error ? err : new Error("Failed to get authentication token"));
      setClerkToken(null);
      setIsLoading(false);
      return null;
    }
  }, [userId, getToken, toast, isSignedIn]);

  // Get a fresh token when the hook is first used or when user auth state changes
  useEffect(() => {
    fetchClerkToken();
  }, [fetchClerkToken]);

  return { 
    clerkToken, 
    isLoading, 
    error, 
    refreshToken: fetchClerkToken,
    isSignedIn,
    userId
  };
};

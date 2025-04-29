
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
      setClerkToken(null);
      setIsLoading(false);
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Get the token from Clerk for Supabase TPA (without template parameter)
      // The Third-Party Auth integration doesn't require a JWT template
      const token = await getToken();
      
      if (!token) {
        const noTokenError = new Error("Failed to get authentication token");
        console.error("No Clerk token available:", noTokenError);
        setError(noTokenError);
        toast({
          title: "Authentication Error",
          description: "Failed to get authentication token from Clerk. Make sure you've enabled Third-Party Authentication for Supabase in your Clerk dashboard.",
          variant: "destructive",
        });
        setClerkToken(null);
        setIsLoading(false);
        return null;
      }
      
      setClerkToken(token);
      return token;
    } catch (err) {
      console.error("Error getting Clerk token:", err);
      setError(err instanceof Error ? err : new Error("Failed to get authentication token"));
      setClerkToken(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId, getToken, toast, isSignedIn]);

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

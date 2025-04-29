
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
      
      // Get the JWT token from Clerk for Supabase TPA
      const token = await getToken({
        template: "supabase",
      });
      
      if (!token) {
        const noTokenError = new Error("Failed to get authentication token");
        console.error("No Clerk token available:", noTokenError);
        setError(noTokenError);
        toast({
          title: "Authentication Error",
          description: "Failed to get authentication token from Clerk. Ensure the JWT template is configured correctly.",
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

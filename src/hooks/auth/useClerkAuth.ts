
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook that manages Clerk authentication state and token retrieval for Supabase TPA
 */
export const useClerkAuth = () => {
  const { userId, getToken, isSignedIn } = useAuth();
  const [clerkToken, setClerkToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Function to get a fresh token from Clerk specifically for Supabase TPA
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
      
      // Get token without specifying a template - this is what the Supabase TPA expects
      // When third-party-clerk is enabled in Supabase, it will verify this token
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
      
      console.log("Successfully retrieved Clerk token for Supabase TPA");
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


import { useEffect, useState } from 'react';
import { useClerkAuth } from './auth/useClerkAuth';
import { useToast } from '@/hooks/use-toast';
import { getAuthenticatedClient, debugSessionInfo } from '@/integrations/supabase/client';

/**
 * Main authentication hook that connects Clerk authentication with Supabase
 * using the Clerk token directly in the Authorization header
 */
export const useClerkSupabaseAuth = () => {
  // Get Clerk authentication state
  const { 
    isLoading: clerkLoading, 
    error: clerkError,
    isSignedIn,
    userId,
    clerkToken
  } = useClerkAuth();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [authAttempted, setAuthAttempted] = useState(false);
  const { toast } = useToast();
  
  // Authenticate with Supabase using Clerk token
  const authenticateWithSupabase = async () => {
    if (!isSignedIn || !userId || !clerkToken) {
      console.log("Not signed in or missing Clerk token, skipping Supabase auth");
      setIsAuthenticated(false);
      setIsLoading(false);
      setAuthAttempted(true);
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log("Authenticating with Supabase using Clerk token...");
      
      // Get authenticated client using token
      const client = getAuthenticatedClient(clerkToken);
      
      // Verify the client works by getting user data
      const { data, error: userError } = await client.auth.getUser();
      
      if (userError) {
        console.error("Authentication error:", userError);
        setError(userError);
        toast({
          title: "Authentication Error",
          description: "Failed to connect with Supabase using your Clerk token. Check your TPA configuration.",
          variant: "destructive",
        });
        setIsAuthenticated(false);
        return false;
      }
      
      if (!data.user) {
        console.error("No user data returned");
        setError(new Error("No user data returned"));
        toast({
          title: "Authentication Error",
          description: "Failed to authenticate with Supabase. Check your Clerk-Supabase TPA configuration.",
          variant: "destructive",
        });
        setIsAuthenticated(false);
        return false;
      }
      
      // Log detailed session info for debugging
      const sessionInfo = await debugSessionInfo(client);
      console.log("Authentication session info:", sessionInfo);
      
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      console.error("Error authenticating with Supabase:", err);
      const errorInstance = err instanceof Error ? err : new Error('Authentication error');
      setError(errorInstance);
      toast({
        title: "Authentication Error",
        description: "Please make sure you have configured your Clerk-Supabase TPA correctly.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
      setAuthAttempted(true);
    }
  };
  
  // Effect to authenticate when Clerk state changes
  useEffect(() => {
    if (!clerkLoading && isSignedIn && clerkToken) {
      authenticateWithSupabase();
    } else if (!clerkLoading) {
      setIsAuthenticated(false);
      setIsLoading(false);
      setAuthAttempted(true);
    }
  }, [clerkLoading, isSignedIn, userId, clerkToken]);
  
  // Function to refresh authentication that can be called on demand
  const refreshAuth = async () => {
    return authenticateWithSupabase();
  };
  
  // Combine errors from both sources
  const combinedError = clerkError || error;
  
  return { 
    isAuthenticated, 
    isLoading: clerkLoading || isLoading, 
    error: combinedError,
    authAttempted,
    refreshAuth,
    userId
  };
};

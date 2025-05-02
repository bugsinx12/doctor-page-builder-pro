
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useToast } from '@/hooks/use-toast';
import { getAuthenticatedClient, debugSessionInfo, testClerkTPAAuthentication } from '@/integrations/supabase/client';

/**
 * Main authentication hook that connects Clerk authentication with Supabase
 * using the Clerk token directly in the Authorization header
 */
export const useClerkSupabaseAuth = () => {
  // Get Clerk authentication state
  const { getToken, userId, isSignedIn } = useAuth();
  const [clerkToken, setClerkToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [authAttempted, setAuthAttempted] = useState(false);
  const { toast } = useToast();
  
  // Fetch the Clerk token
  const fetchClerkToken = async () => {
    if (!isSignedIn || !userId) {
      setClerkToken(null);
      return null;
    }

    try {
      // Get token from Clerk - use JWT template specifically configured for Supabase
      // Make sure you've created this template in your Clerk dashboard
      const token = await getToken({ template: 'supabase' });
      
      if (!token) {
        console.error("No token available from Clerk");
        return null;
      }
      
      setClerkToken(token);
      return token;
    } catch (err) {
      console.error("Error getting Clerk token:", err);
      return null;
    }
  };
  
  // Authenticate with Supabase using Clerk token
  const authenticateWithSupabase = async () => {
    const token = await fetchClerkToken();
    
    if (!token) {
      console.log("No Clerk token available, skipping Supabase auth");
      setIsAuthenticated(false);
      setIsLoading(false);
      setAuthAttempted(true);
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log("Authenticating with Supabase using Clerk token...");
      
      // Test TPA authentication
      const authResult = await testClerkTPAAuthentication(token);
      
      if (!authResult.success) {
        console.error("Authentication error:", authResult.message);
        setError(new Error(authResult.message));
        toast({
          title: "Authentication Error",
          description: "Failed to connect with Supabase using your Clerk token. Check your TPA configuration in Clerk Dashboard.",
          variant: "destructive",
        });
        setIsAuthenticated(false);
        setIsLoading(false);
        setAuthAttempted(true);
        return false;
      }
      
      // Log detailed session info for debugging
      const client = getAuthenticatedClient(token);
      const sessionInfo = await debugSessionInfo(client);
      console.log("Authentication session info:", sessionInfo);
      
      setIsAuthenticated(true);
      setIsLoading(false);
      setAuthAttempted(true);
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
      setIsAuthenticated(false);
      setIsLoading(false);
      setAuthAttempted(true);
      return false;
    }
  };
  
  // Effect to authenticate when Clerk state changes
  useEffect(() => {
    if (isSignedIn) {
      authenticateWithSupabase();
    } else {
      setIsAuthenticated(false);
      setIsLoading(false);
      setAuthAttempted(true);
    }
  }, [isSignedIn, userId]);
  
  // Function to refresh authentication that can be called on demand
  const refreshAuth = async () => {
    return authenticateWithSupabase();
  };
  
  return { 
    isAuthenticated, 
    isLoading, 
    error,
    authAttempted,
    refreshAuth,
    userId,
    clerkToken
  };
};

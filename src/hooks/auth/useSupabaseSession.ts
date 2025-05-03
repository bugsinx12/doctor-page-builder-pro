
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';

/**
 * Hook that handles the Supabase session based on a Clerk authentication token
 * using Supabase's Third-Party Auth (TPA) integration for Clerk
 */
export const useSupabaseSession = (clerkToken: string | null, isSignedIn: boolean) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [authAttempted, setAuthAttempted] = useState(false);
  const { toast } = useToast();

  // Function to authenticate with Supabase using the Clerk token via TPA
  const authenticateWithSupabase = useCallback(async (token: string | null) => {
    if (!token || !isSignedIn) {
      console.log("No token or not signed in with Clerk, skipping Supabase auth");
      setIsAuthenticated(false);
      setIsLoading(false);
      setAuthAttempted(true);
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Authenticating with Supabase using Clerk token via TPA...");
      
      // Test authentication by making a request with the token
      const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`, {
        headers: {
          'apikey': SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const authError = new Error(`Authentication failed: ${response.statusText}`);
        console.error("Supabase-Clerk auth error:", authError);
        setError(authError);
        toast({
          title: "Authentication Error",
          description: "Failed to connect Clerk with Supabase. Please check your Third-Party Auth configuration.",
          variant: "destructive",
        });
        setIsAuthenticated(false);
        setIsLoading(false);
        setAuthAttempted(true);
        return false;
      }
      
      const data = await response.json();
      console.log("Authentication successful with data:", data);
      setIsAuthenticated(true);
      setIsLoading(false);
      setAuthAttempted(true);
      return true;
    } catch (err) {
      console.error('Error authenticating with Supabase:', err);
      const errorInstance = err instanceof Error ? err : new Error('Authentication error');
      setError(errorInstance);
      toast({
        title: "Authentication Error",
        description: "Failed to initialize secure connection. Please check your Clerk-Supabase integration.",
        variant: "destructive",
      });
      setIsAuthenticated(false);
      setIsLoading(false);
      setAuthAttempted(true);
      return false;
    }
  }, [isSignedIn, toast]);

  return { 
    isAuthenticated, 
    isLoading, 
    error, 
    authAttempted,
    authenticateWithSupabase
  };
};


import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { supabase, getSupabaseWithClerkToken } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook to check if the user is authenticated with Supabase via Clerk JWT
 */
export function useSupabaseAuth() {
  const { userId, getToken, isSignedIn } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [client, setClient] = useState(supabase);
  const { toast } = useToast();

  // Function to check authentication that can be called on demand
  const checkAuth = useCallback(async () => {
    if (!userId || !isSignedIn) {
      setIsAuthenticated(false);
      setClient(supabase);
      setIsLoading(false);
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Get token from Clerk with supabase template
      const token = await getToken({
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

      // Create authenticated client
      const authenticatedClient = getSupabaseWithClerkToken(token);
      setClient(authenticatedClient);
      
      // Test authentication with a simple query
      const { error: testError } = await authenticatedClient
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (testError && !testError.message.includes('No rows found')) {
        console.error("Supabase auth error:", testError);
        setError(testError);
        toast({
          title: "Authentication Error",
          description: "Failed to authenticate with Supabase. Check your JWT template configuration.",
          variant: "destructive",
        });
        setIsAuthenticated(false);
        setIsLoading(false);
        return false;
      }

      setIsAuthenticated(true);
      setError(null);
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
      setIsLoading(false);
      return false;
    }
  }, [userId, getToken, toast, isSignedIn]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { 
    isAuthenticated, 
    isLoading, 
    error, 
    userId,
    client,
    refreshAuth: checkAuth
  };
}

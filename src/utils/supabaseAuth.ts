
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';

/**
 * Hook to check if the user is authenticated with Supabase via Clerk JWT
 * This revised approach uses the JWT 'sub' claim directly for authentication
 */
export function useSupabaseAuth() {
  const { userId, getToken, isSignedIn } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Function to check authentication that can be called on demand
  const checkAuth = useCallback(async () => {
    if (!userId || !isSignedIn) {
      setIsAuthenticated(false);
      setSupabaseUserId(null);
      setIsLoading(false);
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Store Clerk ID for use in application logic
      setSupabaseUserId(userId);
      
      // Get token from Clerk with custom claims
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

      // Test authentication by making a direct fetch request
      const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`, {
        headers: {
          'apikey': SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error("Supabase auth error:", response.statusText);
        setError(new Error(`Authentication failed: ${response.statusText}`));
        toast({
          title: "Authentication Error",
          description: "Failed to authenticate with Supabase. Check your JWT template configuration.",
          variant: "destructive",
        });
        setIsAuthenticated(false);
        setIsLoading(false);
        return false;
      }

      // Authentication successful
      setIsAuthenticated(true);
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
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId, getToken, toast, isSignedIn]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { 
    isAuthenticated, 
    isLoading, 
    error, 
    supabaseUserId,
    refreshAuth: checkAuth,
    userId, // Add userId here for components that need it
    authAttempted: !isLoading // If we're not loading, we've attempted auth
  };
}

/**
 * Hook to handle authenticated Supabase requests
 * This approach uses the original Supabase client and provides a way to get auth headers
 */
export function useSupabaseClient() {
  const { getToken, isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Function to get authentication headers
  const getAuthHeaders = useCallback(async () => {
    if (!isSignedIn) {
      return {};
    }

    try {
      // Get token from Clerk for authentication
      const token = await getToken({
        template: "supabase"
      });
      
      if (!token) {
        throw new Error("No authentication token available");
      }

      return {
        Authorization: `Bearer ${token}`
      };
    } catch (err) {
      console.error("Error getting auth headers:", err);
      throw err;
    }
  }, [getToken, isSignedIn]);

  // Initialize the client loading state
  useEffect(() => {
    const initClient = async () => {
      if (!isSignedIn) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Just test that we can get a token
        const token = await getToken({
          template: "supabase"
        });
        
        if (!token) {
          throw new Error("No authentication token available");
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error initializing Supabase client:", err);
        setError(err instanceof Error ? err : new Error("Failed to initialize Supabase client"));
        toast({
          title: "Authentication Error",
          description: "Failed to initialize secure connection. Please check your Clerk JWT template.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    initClient();
  }, [getToken, toast, isSignedIn]);

  return { 
    client: supabase, 
    getAuthHeaders, 
    isLoading, 
    error, 
    refreshClient: async () => {
      setIsLoading(true);
      try {
        await getToken({ template: "supabase" });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to refresh client"));
      } finally {
        setIsLoading(false);
      }
    }
  };
}

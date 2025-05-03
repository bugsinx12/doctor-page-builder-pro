import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
        template: "supabase-jwt"
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

      // Test if authentication works using the Authorization header
      // We use Promise.then() because we can't directly attach headers to the builder
      const result = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .then(async response => {
          const requestOptions = {
            headers: {
              Authorization: `Bearer ${token}`
            }
          };
          const res = await fetch(response.url, requestOptions);
          const data = await res.json();
          return { data: data.data, error: data.error };
        });

      if (result.error) {
        console.error("Supabase auth error:", result.error);
        setError(new Error(result.error.message));
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
 * Hook to get an authenticated Supabase client
 * This revised approach uses JWT with 'sub' claim directly
 */
export function useSupabaseClient() {
  const { getToken, isSignedIn } = useAuth();
  const [client, setClient] = useState(supabase);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Function to initialize the client that can be called on demand
  const initClient = useCallback(async () => {
    if (!isSignedIn) {
      setIsLoading(false);
      return supabase;
    }
    
    try {
      setIsLoading(true);
      setError(null);

      // Get token from Clerk for authentication
      const token = await getToken({
        template: "supabase-jwt"
      });
      
      if (!token) {
        throw new Error("No authentication token available");
      }

      // Instead of modifying the client, we'll return methods to help with authenticated requests
      const authMethods = {
        getAuthHeaders: () => ({
          Authorization: `Bearer ${token}`
        }),
        authFetch: async (url: string, options: RequestInit = {}) => {
          const authOptions = {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${token}`
            }
          };
          return fetch(url, authOptions);
        }
      };

      // Keep the original client, but store the auth methods for future use
      setClient({
        ...supabase,
        auth: {
          ...supabase.auth,
          // Add helper method to get the current token
          getToken: () => token
        }
      });
      
      return {
        ...supabase,
        ...authMethods
      };
    } catch (err) {
      console.error("Error initializing Supabase client:", err);
      setError(err instanceof Error ? err : new Error("Failed to initialize Supabase client"));
      toast({
        title: "Authentication Error",
        description: "Failed to initialize secure connection. Please check your Clerk JWT template.",
        variant: "destructive",
      });
      return supabase;
    } finally {
      setIsLoading(false);
    }
  }, [getToken, toast, isSignedIn]);

  useEffect(() => {
    if (isSignedIn) {
      initClient();
    }
  }, [initClient, isSignedIn]);

  return { client, isLoading, error, refreshClient: initClient };
}

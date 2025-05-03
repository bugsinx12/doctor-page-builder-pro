
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from "@/integrations/supabase/types";

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

      // Create authenticated client with token
      const authClient = supabase.rest.headers.set({
        Authorization: `Bearer ${token}`
      });
      
      // Test if authentication works
      const { data, error: authError } = await authClient
        .from('profiles')
        .select('id')
        .limit(1);

      if (authError) {
        console.error("Supabase auth error:", authError);
        setError(new Error(authError.message));
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
    refreshAuth: checkAuth
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

      // Create authenticated client with token
      const authenticatedClient = supabase.rest.headers.set({
        Authorization: `Bearer ${token}`
      });

      setClient(authenticatedClient);
      return authenticatedClient;
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

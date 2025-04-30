
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

      // Sign in to Supabase using the Clerk token
      const { data, error: authError } = await supabase.auth.signInWithOtp({
        token: token,
      });

      if (authError) {
        console.error("Supabase auth error:", authError);
        setError(authError);
        toast({
          title: "Authentication Error",
          description: "Failed to authenticate with Supabase. Check your JWT template configuration.",
          variant: "destructive",
        });
        setIsAuthenticated(false);
        setIsLoading(false);
        return false;
      }

      // Verify the session is active
      const { data: userData } = await supabase.auth.getUser();
      const isAuthValid = !!userData.user;
      setIsAuthenticated(isAuthValid);
      
      if (!isAuthValid) {
        const validationError = new Error("Session validation failed");
        setError(validationError);
        toast({
          title: "Authentication Error",
          description: "Your authentication session could not be validated. Please try signing in again.",
          variant: "destructive",
        });
        return false;
      }
      
      return isAuthValid;
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

      // Get authenticated client using Clerk token with JWT template
      const token = await getToken({
        template: "supabase-jwt"
      });
      
      if (!token) {
        throw new Error("No authentication token available");
      }

      // Sign in to Supabase using the Clerk JWT
      const { data, error } = await supabase.auth.signInWithOtp({
        token: token,
      });

      if (error) {
        throw error;
      }

      setClient(supabase);
      return supabase;
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

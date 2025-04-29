
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { supabase, signInWithClerk } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useClerkSupabaseAuth = () => {
  const { userId, getToken, isSignedIn } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [authAttempted, setAuthAttempted] = useState(false);
  const { toast } = useToast();

  // Function to sync auth state that can be called on demand
  const syncAuthState = useCallback(async () => {
    if (!userId || !isSignedIn) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return false;
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
        setIsAuthenticated(false);
        setIsLoading(false);
        setAuthAttempted(true);
        return false;
      }
      
      console.log("Got Clerk token, signing in to Supabase");
      
      // Sign in to Supabase using the Clerk token
      const { success, error: authError, message } = await signInWithClerk(token);
      
      if (!success) {
        console.error("Supabase-Clerk auth error:", authError);
        setError(authError instanceof Error ? authError : new Error(message || "Authentication failed"));
        toast({
          title: "Authentication Error",
          description: message || "Failed to connect Clerk with Supabase. Please check your Third-Party Auth configuration.",
          variant: "destructive",
        });
        setIsAuthenticated(false);
        setIsLoading(false);
        setAuthAttempted(true);
        return false;
      }
      
      // Verify the session worked by checking user
      const { data, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Supabase get user error:", userError);
        setError(userError);
        toast({
          title: "Authentication Error",
          description: "Failed to verify user authentication. Please check your Clerk-Supabase integration.",
          variant: "destructive",
        });
        setIsAuthenticated(false);
        setIsLoading(false);
        setAuthAttempted(true);
        return false;
      }
      
      console.log("Authentication check result:", !!data.user);
      setIsAuthenticated(!!data.user);
      setIsLoading(false);
      setAuthAttempted(true);
      return !!data.user;
    } catch (err) {
      console.error('Error syncing auth state:', err);
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
  }, [userId, isSignedIn, getToken, toast]);

  useEffect(() => {
    syncAuthState();
  }, [syncAuthState]);

  return { 
    isAuthenticated, 
    isLoading, 
    error, 
    authAttempted,
    refreshAuth: syncAuthState
  };
};

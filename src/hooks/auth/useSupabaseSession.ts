
import { useState, useCallback } from 'react';
import { supabase, signInWithClerk } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook that handles the Supabase session based on a Clerk authentication token
 */
export const useSupabaseSession = (clerkToken: string | null, isSignedIn: boolean) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [authAttempted, setAuthAttempted] = useState(false);
  const { toast } = useToast();

  // Function to authenticate with Supabase using the Clerk token
  const authenticateWithSupabase = useCallback(async (token: string | null) => {
    if (!token || !isSignedIn) {
      setIsAuthenticated(false);
      setIsLoading(false);
      setAuthAttempted(true);
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Signing in to Supabase with Clerk token");
      
      // Sign in to Supabase using the Clerk token via the Third-Party Auth flow
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

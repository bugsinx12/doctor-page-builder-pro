
import { useState, useCallback, useEffect } from 'react';
import { useSession } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * @deprecated Use useClerkSupabaseAuth or useClerkSupabaseClient instead.
 * This file is kept for backward compatibility.
 */

/**
 * Hook to check if the user is authenticated with Supabase via Clerk JWT
 * This revised approach uses the JWT 'sub' claim directly for authentication
 */
export function useSupabaseAuth() {
  const { session, isSignedIn } = useSession();
  const userId = session?.user?.id || null;
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
      const token = await session?.getToken({
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

      // Test our authentication
      try {
        const response = await fetch(`${supabase.supabaseUrl}/rest/v1/profiles?select=id&limit=1`, {
          headers: {
            'apikey': supabase.supabaseKey,
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
      } catch (err) {
        console.error("Error testing auth:", err);
        throw err;
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
  }, [userId, session, toast, isSignedIn]);

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

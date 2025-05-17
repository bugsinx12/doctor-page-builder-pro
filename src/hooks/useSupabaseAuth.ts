
import { useState, useCallback, useEffect } from 'react';
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { AuthSession } from '@supabase/supabase-js';

/**
 * Hook to check if the user is authenticated with Supabase
 */
export function useSupabaseAuth() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Function to check authentication that can be called on demand
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get session from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }
      
      if (!session) {
        setIsAuthenticated(false);
        setUserId(null);
        setSession(null);
        setIsLoading(false);
        return false;
      }

      // Store user ID for use in application logic
      setUserId(session.user.id);
      setSession(session);
      
      // Test our authentication with a direct API call using the token
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`, {
          headers: {
            'apikey': SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!response.ok) {
          console.error("Supabase auth error:", response.statusText);
          setError(new Error(`Authentication failed: ${response.statusText}`));
          
          // Log more details for debugging
          const errorText = await response.text();
          console.error("Auth error details:", errorText);
          
          toast({
            title: "Authentication Error",
            description: "Authentication verification failed.",
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
        description: "Please sign in again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth event:", event);
      if (currentSession) {
        setSession(currentSession);
        setUserId(currentSession.user.id);
        setIsAuthenticated(true);
      } else {
        setSession(null);
        setUserId(null);
        setIsAuthenticated(false);
      }
      
      // Don't run a full check here as it would cause infinite loops
      setIsLoading(false);
    });

    // Initial auth check
    checkAuth();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [checkAuth]);

  return { 
    isAuthenticated, 
    isLoading, 
    error, 
    session,
    user: session?.user || null,
    refreshAuth: checkAuth,
    userId, 
    authAttempted: !isLoading // If we're not loading, we've attempted auth
  };
}

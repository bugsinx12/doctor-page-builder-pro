
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Ensure these are defined, perhaps move them to a config file or env variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://isjjzddntanbjopqylic.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlzamp6ZGRudGFuYmpvcHF5bGljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NzEyMDAsImV4cCI6MjA2MDE0NzIwMH0._Y8ux53LbbT5aAVAyHJduvMGvHuBmKD34fU6xktyjR8";

/**
 * Hook to get a Supabase client authenticated via Clerk TPA (Third-Party Auth).
 * This client uses the Clerk session token dynamically.
 */
export function useAuthenticatedSupabase() {
  const { getToken, isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Memoize the client creation to avoid re-creating it on every render
  const client = useMemo(() => {
    // Create ONE Supabase client that uses the Clerk token via accessToken function
    return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      global: {
        fetch: async (input, init) => {
          try {
            // Get the latest token before each request
            const token = await getToken({ template: 'supabase' }); // Use supabase template
            if (!token) {
              console.warn("No Clerk token available for Supabase request.");
              // Allow request to proceed without Authorization header if desired,
              // or throw an error if auth is strictly required.
              // Supabase RLS should handle unauthorized access gracefully.
            } else {
              // Inject the token into the Authorization header
              init = init || {};
              init.headers = { ...init.headers, Authorization: `Bearer ${token}` };
            }
            return fetch(input, init);
          } catch (e) {
            console.error("Error fetching Clerk token for Supabase:", e);
            setError(e instanceof Error ? e : new Error("Failed to get auth token"));
            // Re-throw or handle error appropriately
            throw e;
          }
        },
      },
      auth: {
        // TPA doesn't rely on Supabase's session persistence
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }, [getToken]); // Re-create client only if getToken function instance changes (rarely)

  // Verify authentication works on mount
  useEffect(() => {
    const verifyAuth = async () => {
      if (!isSignedIn) {
        setIsLoading(false);
        setIsAuthenticated(false);
        return;
      }

      try {
        // A simple query to test if authentication is working
        const { error: authError } = await client
          .from('profiles')
          .select('id')
          .limit(1);
        
        if (authError) {
          console.error("Authentication verification failed:", authError);
          setError(new Error(authError.message));
          setIsAuthenticated(false);
        } else {
          setError(null);
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error("Error verifying authentication:", e);
        setError(e instanceof Error ? e : new Error("Failed to verify authentication"));
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (isSignedIn) {
      verifyAuth();
    } else {
      setIsLoading(false);
    }
  }, [isSignedIn, client]);

  return {
    client,
    isLoading,
    error,
    isAuthenticated,
  };
}

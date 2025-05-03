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

  // Memoize the client creation to avoid re-creating it on every render
  const client = useMemo(() => {
    // Create ONE Supabase client that uses the Clerk token via accessToken function
    return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      global: {
        fetch: async (input, init) => {
          try {
            // Get the latest token before each request
            const token = await getToken(); // Use default getToken for TPA
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

  // Update loading state based on Clerk's sign-in status
  useEffect(() => {
    // Consider Clerk's loading state if available, otherwise just use isSignedIn
    setIsLoading(!isSignedIn); // Simple loading state, adjust if Clerk provides its own loading status
    if (isSignedIn) {
      setError(null); // Clear error on sign-in
    }
  }, [isSignedIn]);

  return {
    client,
    isLoading, // Reflects Clerk's sign-in readiness primarily
    error,     // Reflects errors during token fetching for requests
    isAuthenticated: isSignedIn ?? false, // Directly use Clerk's state
  };
}

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Supabase project URL and anonymous key
const SUPABASE_URL = "https://isjjzddntanbjopqylic.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlzamp6ZGRudGFuYmpvcHF5bGljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NzEyMDAsImV4cCI6MjA2MDE0NzIwMH0._Y8ux53LbbT5aAVAyHJduvMGvHuBmKD34fU6xktyjR8";

/**
 * Hook to get a Supabase client authenticated with Clerk
 */
export function useClerkSupabaseClient() {
  const { getToken, isSignedIn } = useAuth();
  const [client, setClient] = useState(() => 
    createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const initClient = async () => {
      if (!isSignedIn) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Get token using the JWT template configured in Clerk
        const token = await getToken({ template: "__session" });
        
        if (!token) {
          throw new Error("No authentication token available from Clerk");
        }
        
        // Create new Supabase client with authentication
        const authenticatedClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
          auth: {
            persistSession: false,
          },
        });
        
        setClient(authenticatedClient);
      } catch (err) {
        console.error("Error initializing Supabase client:", err);
        setError(err instanceof Error ? err : new Error("Failed to initialize Supabase client"));
      } finally {
        setIsLoading(false);
      }
    };
    
    initClient();
  }, [getToken, isSignedIn]);
  
  // Function to refresh the client with a new token
  const refreshClient = async () => {
    if (!isSignedIn) return client;
    
    try {
      const token = await getToken({ template: "__session" });
      
      if (!token) {
        throw new Error("No authentication token available from Clerk");
      }
      
      const authenticatedClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        auth: {
          persistSession: false,
        },
      });
      
      setClient(authenticatedClient);
      return authenticatedClient;
    } catch (err) {
      console.error("Error refreshing Supabase client:", err);
      throw err;
    }
  };
  
  return {
    client,
    isLoading,
    error,
    refreshClient,
  };
}

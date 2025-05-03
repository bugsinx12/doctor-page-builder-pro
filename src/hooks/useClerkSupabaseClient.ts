import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = "https://isjjzddntanbjopqylic.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlzamp6ZGRudGFuYmpvcHF5bGljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NzEyMDAsImV4cCI6MjA2MDE0NzIwMH0._Y8ux53LbbT5aAVAyHJduvMGvHuBmKD34fU6xktyjR8";

/**
 * Hook to get a Supabase client authenticated with Clerk via TPA
 */
export function useClerkSupabaseClient() {
  const { getToken, isSignedIn } = useAuth();
  const [client, setClient] = useState(() => 
    createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
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
        
        // Get token from Clerk specifically for Supabase TPA
        const token = await getToken({
          resource: "https://isjjzddntanbjopqylic.supabase.co"
        });
        
        if (!token) {
          throw new Error("No authentication token available from Clerk");
        }
        
        // Create new Supabase client with TPA token
        const authenticatedClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
          },
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        });

        // Test the connection by getting the user
        const { data: userData, error: userError } = await authenticatedClient.auth.getUser();
        if (userError) throw userError;
        if (!userData.user) throw new Error("No user data returned");
        
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
  
  const refreshClient = async () => {
    if (!isSignedIn) return client;
    
    try {
      const token = await getToken({
        resource: "https://isjjzddntanbjopqylic.supabase.co"
      });
      
      if (!token) {
        throw new Error("No authentication token available from Clerk");
      }
      
      const authenticatedClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
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


import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Get an authenticated Supabase client using Clerk JWT
 */
export async function getAuthenticatedClient() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("Authentication required");
  }
  
  return supabase;
}

/**
 * Hook to get an authenticated Supabase client using Clerk JWT
 * @returns An authenticated Supabase client and authentication status
 */
export function useSupabaseClient() {
  const { getToken, userId } = useAuth();
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const setupClient = async () => {
      if (!userId) {
        setClient(null);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Get JWT token from Clerk using the Supabase template
        const token = await getToken({ template: "supabase" });
        
        if (token) {
          // Set the auth JWT on the Supabase client
          const { error: authError } = await supabase.auth.setSession({
            access_token: token,
            refresh_token: token, // Using same token as refresh token for simplicity
          });
          
          if (authError) {
            console.error("Error setting Supabase session:", authError);
            setError(new Error("Failed to authenticate with Supabase"));
            setClient(null);
          } else {
            // Return the authenticated client
            setClient(supabase);
          }
        } else {
          setClient(null);
          setError(new Error("No JWT token available"));
        }
      } catch (err) {
        console.error("Error setting up Supabase client:", err);
        setError(err instanceof Error ? err : new Error("Authentication error"));
        setClient(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    setupClient();
  }, [userId, getToken]);
  
  return { client, isLoading, error };
}

/**
 * Hook to check if the user is authenticated with Supabase
 */
export function useSupabaseAuth() {
  const { getToken, userId } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const setupSupabaseAuth = async () => {
      if (!userId) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Get JWT token from Clerk using the Supabase template
        const token = await getToken({ template: "supabase" });
        
        if (token) {
          // Set the auth JWT on the Supabase client
          const { error: authError } = await supabase.auth.setSession({
            access_token: token,
            refresh_token: token, // Using same token as refresh token for simplicity
          });
          
          if (authError) {
            console.error("Error setting Supabase session:", authError);
            setError(new Error("Failed to authenticate with Supabase"));
            setIsAuthenticated(false);
          } else {
            // Verify the session is active
            const { data } = await supabase.auth.getUser();
            setIsAuthenticated(!!data.user);
          }
        } else {
          setIsAuthenticated(false);
          setError(new Error("No JWT token available"));
        }
      } catch (err) {
        console.error("Error in Supabase auth:", err);
        setError(err instanceof Error ? err : new Error("Authentication error"));
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    setupSupabaseAuth();
  }, [userId, getToken]);

  return { isAuthenticated, isLoading, error };
}

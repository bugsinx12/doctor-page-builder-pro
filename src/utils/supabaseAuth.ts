
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";
import getUUIDFromClerkID from "./getUUIDFromClerkID";
import type { Database } from "@/integrations/supabase/types";

// Cache for the Supabase client to prevent unnecessary recreations
let authenticatedClient: SupabaseClient<Database> | null = null;

/**
 * Get an authenticated Supabase client using Clerk JWT
 */
export async function getAuthenticatedClient(getToken: () => Promise<string | null>) {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token available");
    }

    // Set the auth JWT on the Supabase client
    const { error: authError } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: token,
    });

    if (authError) {
      throw authError;
    }

    // Return the authenticated client
    return supabase;
  } catch (error) {
    console.error("Error getting authenticated client:", error);
    throw error;
  }
}

/**
 * Hook to get an authenticated Supabase client
 */
export function useSupabaseClient() {
  const { getToken } = useAuth();
  const [client, setClient] = useState<SupabaseClient<Database> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initClient = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Use the default "supabase" JWT template from Clerk
        const authClient = await getAuthenticatedClient(() => 
          getToken({ template: "supabase" })
        );

        setClient(authClient);
      } catch (err) {
        console.error("Error initializing Supabase client:", err);
        setError(err instanceof Error ? err : new Error("Failed to initialize Supabase client"));
        toast({
          title: "Authentication Error",
          description: "Failed to initialize secure connection. Please check your JWT template configuration in Clerk dashboard.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initClient();

    // Cleanup function
    return () => {
      authenticatedClient = null;
    };
  }, [getToken, toast]);

  return { client, isLoading, error };
}

/**
 * Hook to check if the user is authenticated with Supabase
 */
export function useSupabaseAuth() {
  const { userId, getToken } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      if (!userId) {
        setIsAuthenticated(false);
        setSupabaseUserId(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get Supabase UUID from Clerk ID for use in application logic
        const convertedUserId = getUUIDFromClerkID(userId);
        setSupabaseUserId(convertedUserId);
        
        // Get JWT token from Clerk using the default "supabase" template
        const token = await getToken({ template: "supabase" });
        
        if (!token) {
          throw new Error("No authentication token available");
        }

        // Set the auth JWT on the Supabase client
        const { error: authError } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: token,
        });

        if (authError) {
          throw authError;
        }

        // Verify the session is active
        const { data } = await supabase.auth.getUser();
        setIsAuthenticated(!!data.user);
      } catch (err) {
        console.error("Error in Supabase auth:", err);
        setError(err instanceof Error ? err : new Error("Authentication error"));
        setIsAuthenticated(false);
        toast({
          title: "Authentication Error",
          description: "Please ensure your Clerk JWT template for Supabase is configured with the correct signing key.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [userId, getToken, toast]);

  return { isAuthenticated, isLoading, error, supabaseUserId };
}


import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { supabase, signInWithClerk } from "@/integrations/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";
import getUUIDFromClerkID from "./getUUIDFromClerkID";
import type { Database } from "@/integrations/supabase/types";

// Cache for the Supabase client to prevent unnecessary recreations
let authenticatedClient: SupabaseClient<Database> | null = null;

/**
 * Get an authenticated Supabase client using Clerk token
 */
export async function getAuthenticatedClient(getToken: () => Promise<string | null>) {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token available");
    }

    // Sign in to Supabase using the Clerk token
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'clerk',
      token: token,
    });

    if (error) {
      throw error;
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

        // Get authenticated client using Clerk token
        const authClient = await getAuthenticatedClient(() => getToken());

        setClient(authClient);
      } catch (err) {
        console.error("Error initializing Supabase client:", err);
        setError(err instanceof Error ? err : new Error("Failed to initialize Supabase client"));
        toast({
          title: "Authentication Error",
          description: "Failed to initialize secure connection. Please check your Clerk-Supabase integration.",
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
        
        // Get token from Clerk
        const token = await getToken();
        
        if (!token) {
          const noTokenError = new Error("No authentication token available");
          setError(noTokenError);
          toast({
            title: "Authentication Error",
            description: "Failed to get authentication token from Clerk.",
            variant: "destructive",
          });
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Sign in to Supabase using Clerk token
        const { data, error: authError } = await supabase.auth.signInWithIdToken({
          provider: 'clerk',
          token: token,
        });

        if (authError) {
          console.error("Supabase auth error:", authError);
          setError(authError);
          toast({
            title: "Authentication Error",
            description: "Failed to authenticate with Supabase using Clerk. Please check your Third-Party Auth integration.",
            variant: "destructive",
          });
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Verify the session is active
        const { data: userData } = await supabase.auth.getUser();
        const isAuthValid = !!userData.user;
        setIsAuthenticated(isAuthValid);
        
        if (!isAuthValid) {
          const validationError = new Error("Session validation failed");
          setError(validationError);
          toast({
            title: "Authentication Error",
            description: "Your authentication session could not be validated. Please try signing in again.",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Error in Supabase auth:", err);
        setError(err instanceof Error ? err : new Error("Authentication error"));
        setIsAuthenticated(false);
        toast({
          title: "Authentication Error",
          description: "Please ensure your Clerk-Supabase Third-Party Auth integration is configured correctly.",
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

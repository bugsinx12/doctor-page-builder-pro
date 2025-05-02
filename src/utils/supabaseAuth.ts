
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { supabase, getAuthenticatedClient } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from "@/integrations/supabase/types";

/**
 * Hook to get an authenticated Supabase client using Clerk's token
 */
export function useSupabaseClient() {
  const { getToken, isSignedIn } = useAuth();
  const [client, setClient] = useState<typeof supabase>(supabase);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Function to initialize the client that can be called on demand
  const initClient = useCallback(async () => {
    if (!isSignedIn) {
      setIsLoading(false);
      return supabase;
    }
    
    try {
      setIsLoading(true);
      setError(null);

      // Get token from Clerk for TPA
      const token = await getToken({
        template: "supabase" // Use the configured JWT template if available
      });
      
      if (!token) {
        throw new Error("No authentication token available");
      }
      
      // Create authenticated client
      const authenticatedClient = getAuthenticatedClient(token);
      
      console.log("Created authenticated Supabase client with Clerk token");
      setClient(authenticatedClient);
      return authenticatedClient;
    } catch (err) {
      console.error("Error initializing Supabase client:", err);
      setError(err instanceof Error ? err : new Error("Failed to initialize Supabase client"));
      toast({
        title: "Authentication Error",
        description: "Failed to initialize secure connection. Please check your Clerk TPA configuration.",
        variant: "destructive",
      });
      return supabase;
    } finally {
      setIsLoading(false);
    }
  }, [getToken, toast, isSignedIn]);

  useEffect(() => {
    if (isSignedIn) {
      initClient();
    }
  }, [initClient, isSignedIn]);

  return { client, isLoading, error, refreshClient: initClient };
}

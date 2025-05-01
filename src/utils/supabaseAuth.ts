
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from "@/integrations/supabase/types";

const SUPABASE_URL = "https://isjjzddntanbjopqylic.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlzamp6ZGRudGFuYmpvcHF5bGljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NzEyMDAsImV4cCI6MjA2MDE0NzIwMH0._Y8ux53LbbT5aAVAyHJduvMGvHuBmKD34fU6xktyjR8";

/**
 * Hook to get an authenticated Supabase client using Clerk TPA
 */
export function useSupabaseClient() {
  const { getToken, isSignedIn } = useAuth();
  const [client, setClient] = useState(supabase);
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

      // Create a Supabase client that sends the Clerk token with every request
      const supabaseClient = createClient<Database>(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
          global: {
            headers: {
              // This will call getToken() for every request
              Authorization: async () => {
                const token = await getToken();
                return `Bearer ${token}`;
              },
            }
          }
        }
      );

      console.log("Created authenticated Supabase client with Clerk token");
      setClient(supabaseClient);
      return supabaseClient;
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

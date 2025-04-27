
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";

export async function getAuthenticatedClient() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    // This is where we previously tried anonymous sign-in
    // Instead, we'll now explicitly require authentication
    throw new Error("Authentication required");
  }
  return supabase;
}

export function useSupabaseAuth() {
  const { getToken, userId } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const setupSupabaseAuth = async () => {
      if (!userId) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const token = await getToken({ template: "supabase" });
        
        if (token) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: token,
            password: token,
          });

          if (!signInError) {
            setIsAuthenticated(true);
          } else {
            console.error("Supabase auth error:", signInError);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error("Auth setup error:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    setupSupabaseAuth();
  }, [userId, getToken]);

  return { isAuthenticated, isLoading };
}

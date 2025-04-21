
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";
import getUUIDFromClerkID from "@/utils/getUUIDFromClerkID";

interface SupabaseAuthState {
  supabaseUserId: string | null;
  isLoading: boolean;
  error: Error | null;
}

export const useSupabaseAuth = () => {
  const { userId } = useAuth();
  const [state, setState] = useState<SupabaseAuthState>({
    supabaseUserId: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!userId) {
      setState({ supabaseUserId: null, isLoading: false, error: null });
      return;
    }

    try {
      const supabaseUserId = getUUIDFromClerkID(userId);
      setState({ supabaseUserId, isLoading: false, error: null });
    } catch (error) {
      console.error("Error converting Clerk ID to UUID:", error);
      setState({ 
        supabaseUserId: null, 
        isLoading: false, 
        error: error instanceof Error ? error : new Error('Failed to get Supabase user ID') 
      });
    }
  }, [userId]);

  return state;
};

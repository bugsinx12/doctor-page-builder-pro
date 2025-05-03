
import { useSession } from '@clerk/clerk-react';
import { createSupabaseClientWithClerk } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Hook to get a Supabase client authenticated with Clerk's session token
 * This is an alternative to useClerkSupabaseClient with less validation
 */
export function useAuthenticatedSupabase() {
  const { session, isSignedIn } = useSession();
  const userId = session?.user?.id || null;

  // Create a token getter function
  const getToken = async () => {
    if (!session) return null;
    try {
      return await session.getToken({ template: 'supabase' }) ?? null;
    } catch (error) {
      console.error("Failed to get Clerk token:", error);
      return null;
    }
  };

  // Create the client with the token getter
  const client: SupabaseClient<Database> = createSupabaseClientWithClerk(getToken);

  return {
    client,
    isLoading: false,
    error: null,
    isAuthenticated: isSignedIn,
    userId
  };
}

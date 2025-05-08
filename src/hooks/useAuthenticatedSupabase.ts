
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

  // Create a token getter function that doesn't specify a template
  // This avoids the "No JWT template exists with name: supabase" error
  const getToken = async () => {
    if (!session) return null;
    try {
      // Get the default JWT token without specifying a template
      return await session.getToken() ?? null;
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

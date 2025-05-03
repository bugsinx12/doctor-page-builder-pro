
import { useAuthenticatedSupabase } from '@/hooks/useAuthenticatedSupabase';

/**
 * A hook that provides a Supabase client that's authenticated with Clerk
 * This is a wrapper around useAuthenticatedSupabase to simplify the API
 */
export function useSupabaseClient() {
  const { client, isAuthenticated, isLoading, error, userId } = useAuthenticatedSupabase();
  
  return {
    client,
    isAuthenticated,
    isLoading,
    error,
    userId
  };
}


import { useEffect } from 'react';
import { useClerkAuth } from './auth/useClerkAuth';
import { useSupabaseSession } from './auth/useSupabaseSession';

/**
 * Main authentication hook that combines Clerk authentication with Supabase session management
 */
export const useClerkSupabaseAuth = () => {
  // Get Clerk authentication state and token
  const { 
    clerkToken, 
    isLoading: clerkLoading, 
    error: clerkError, 
    refreshToken,
    isSignedIn,
    userId
  } = useClerkAuth();
  
  // Manage Supabase session based on Clerk token
  const { 
    isAuthenticated, 
    isLoading: supabaseLoading, 
    error: supabaseError, 
    authAttempted,
    authenticateWithSupabase 
  } = useSupabaseSession(clerkToken, isSignedIn);
  
  // Sync Clerk token with Supabase session
  useEffect(() => {
    if (clerkToken && !supabaseLoading) {
      authenticateWithSupabase(clerkToken);
    }
  }, [clerkToken, authenticateWithSupabase, supabaseLoading]);
  
  // Function to refresh authentication that can be called on demand
  const refreshAuth = async () => {
    const token = await refreshToken();
    if (token) {
      return authenticateWithSupabase(token);
    }
    return false;
  };
  
  // Combine errors from both sources
  const error = clerkError || supabaseError;
  
  return { 
    isAuthenticated, 
    isLoading: clerkLoading || supabaseLoading, 
    error,
    authAttempted,
    refreshAuth
  };
};

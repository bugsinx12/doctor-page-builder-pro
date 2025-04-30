
import { useEffect, useState } from 'react';
import { useClerkAuth } from './auth/useClerkAuth';
import { useSupabaseSession } from './auth/useSupabaseSession';
import { useToast } from '@/hooks/use-toast';

/**
 * Main authentication hook that combines Clerk authentication with Supabase session management
 * using Third-Party Authentication (TPA) integration and handles JWT claims
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
  
  const { toast } = useToast();
  
  // Manage Supabase session based on Clerk token
  const { 
    isAuthenticated, 
    isLoading: supabaseLoading, 
    error: supabaseError, 
    authAttempted,
    authenticateWithSupabase 
  } = useSupabaseSession(clerkToken, isSignedIn);
  
  // Sync Clerk token with Supabase session using TPA
  useEffect(() => {
    if (clerkToken && !supabaseLoading && isSignedIn) {
      authenticateWithSupabase(clerkToken);
    }
  }, [clerkToken, authenticateWithSupabase, supabaseLoading, isSignedIn]);

  // After successful auth, check if webhook sync might be needed
  useEffect(() => {
    if (isAuthenticated && userId && !supabaseLoading && !clerkLoading) {
      console.log("Authentication successful, user ID:", userId);
      // In a real app, we could verify here if the user exists in Supabase profiles
      // but we're relying on the webhook to handle that synchronization
    }
  }, [isAuthenticated, userId, supabaseLoading, clerkLoading]);
  
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
    refreshAuth,
    userId
  };
};

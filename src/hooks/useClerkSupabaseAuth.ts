
import { useEffect, useState } from 'react';
import { useClerkAuth } from './auth/useClerkAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

/**
 * Main authentication hook that combines Clerk authentication with Supabase session management
 * using JWT claims with `sub` field for user identification
 */
export const useClerkSupabaseAuth = () => {
  // Get Clerk authentication state
  const { 
    isLoading: clerkLoading, 
    error: clerkError,
    isSignedIn,
    userId
  } = useClerkAuth();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [authAttempted, setAuthAttempted] = useState(false);
  const { toast } = useToast();
  
  // Authenticate with Supabase using Clerk JWT
  const authenticateWithSupabase = async () => {
    if (!isSignedIn || !userId) {
      setIsAuthenticated(false);
      setIsLoading(false);
      setAuthAttempted(true);
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // The JWT from Clerk will contain the user's ID in the 'sub' claim
      // which is what our RLS policies will use
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }
      
      if (sessionData.session) {
        // We already have a valid session
        console.log("Existing Supabase session found");
        setIsAuthenticated(true);
        setIsLoading(false);
        setAuthAttempted(true);
        return true;
      }
      
      // No session, try to get one using the current auth state
      console.log("No existing session, checking current authentication");
      
      // Get user data to verify authentication
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw userError;
      }
      
      setIsAuthenticated(!!userData.user);
      console.log("Authentication status:", !!userData.user);
      
      return !!userData.user;
    } catch (err) {
      console.error("Error authenticating with Supabase:", err);
      const errorInstance = err instanceof Error ? err : new Error('Authentication error');
      setError(errorInstance);
      toast({
        title: "Authentication Error",
        description: "Please make sure you have configured your Clerk JWT template correctly.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
      setAuthAttempted(true);
    }
  };
  
  // Effect to authenticate when Clerk state changes
  useEffect(() => {
    if (!clerkLoading && isSignedIn) {
      authenticateWithSupabase();
    } else if (!clerkLoading) {
      setIsAuthenticated(false);
      setIsLoading(false);
      setAuthAttempted(true);
    }
  }, [clerkLoading, isSignedIn, userId]);
  
  // Function to refresh authentication that can be called on demand
  const refreshAuth = async () => {
    return authenticateWithSupabase();
  };
  
  // Combine errors from both sources
  const combinedError = clerkError || error;
  
  return { 
    isAuthenticated, 
    isLoading: clerkLoading || isLoading, 
    error: combinedError,
    authAttempted,
    refreshAuth,
    userId
  };
};

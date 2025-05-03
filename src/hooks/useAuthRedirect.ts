// src/hooks/useAuthRedirect.ts
import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuthenticatedSupabase } from '@/hooks/useAuthenticatedSupabase'; // Import the new hook
import { useProfile } from './useProfile'; // Import useProfile to check profile status


export function useAuthRedirect() {
  const { isSignedIn, isLoaded } = useAuth(); // Only need isSignedIn and isLoaded from useAuth
  const { user } = useUser(); // Need user to check profile potentially
  const navigate = useNavigate();
  const { toast } = useToast();
  // Use the new hook to get the authenticated client and its status
  const { isLoading: supabaseLoading, error: supabaseError, isAuthenticated: supabaseAuthenticated } = useAuthenticatedSupabase();
  // Use useProfile to check if the profile exists (indicating onboarding completion)
  const { profile, isLoading: profileLoading } = useProfile();

  useEffect(() => {
    // Wait for Clerk, Supabase client, and profile to finish loading
    if (!isLoaded || supabaseLoading || profileLoading) {
      console.log("AuthRedirect: Waiting for loading states...", { isLoaded, supabaseLoading, profileLoading });
      return;
    }

    console.log("AuthRedirect: Checking authentication status...", { isSignedIn, supabaseAuthenticated });

    if (isSignedIn && supabaseAuthenticated) {
      // User is signed in via Clerk and Supabase client is authenticated via TPA
      console.log("AuthRedirect: User is signed in and Supabase client is authenticated.");

      // Check if the profile exists
      if (profile) {
        console.log("AuthRedirect: Profile exists.");
        // If profile exists, user is likely onboarded. Stay on current page or redirect to dashboard if desired.
        // Example: if (window.location.pathname === '/onboarding') navigate('/dashboard');
      } else {
        console.log("AuthRedirect: Profile does not exist, redirecting to onboarding.");
        // If profile doesn't exist, redirect to onboarding
        if (window.location.pathname !== '/onboarding') {
          navigate("/onboarding", { replace: true });
        }
      }

      // Handle Supabase client errors during authentication attempts
      if (supabaseError) {
        console.error("AuthRedirect: Supabase client encountered an error:", supabaseError);
        toast({
          title: "Database Connection Issue",
          description: `Could not reliably connect to the database: ${supabaseError.message}. Some features might be unavailable.`,
          variant: "destructive",
        });
      }

    } else if (!isSignedIn) {
      // User is not signed in, redirect to auth page
      console.log("AuthRedirect: User is not signed in, redirecting to /auth");
      if (window.location.pathname !== '/auth') {
        navigate('/auth');
      }
    }

  }, [
    isSignedIn,
    isLoaded,
    supabaseAuthenticated,
    supabaseLoading,
    profileLoading,
    profile,
    supabaseError,
    navigate,
    toast,
    user // Added user dependency as profile hook might depend on it indirectly
  ]); // Removed optional semicolon

  // Return loading state if needed by the component using this hook
  return { isLoading: !isLoaded || supabaseLoading || profileLoading }; // Ensure this line is clean
 }
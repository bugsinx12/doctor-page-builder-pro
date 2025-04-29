
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { supabase, signInWithClerk } from '@/integrations/supabase/client';
import getUUIDFromClerkID from '@/utils/getUUIDFromClerkID';
import { useToast } from '@/components/ui/use-toast';

export const useClerkSupabaseAuth = () => {
  const { userId, getToken, isSignedIn } = useAuth();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [authAttempted, setAuthAttempted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const syncAuthState = async () => {
      if (!userId || !isSignedIn) {
        setAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Get the JWT token from Clerk
        const token = await getToken();
        
        if (!token) {
          const noTokenError = new Error("Failed to get authentication token");
          console.error("No Clerk token available:", noTokenError);
          setError(noTokenError);
          toast({
            title: "Authentication Error",
            description: "Failed to get authentication token from Clerk.",
            variant: "destructive",
          });
          setAuthenticated(false);
          setLoading(false);
          setAuthAttempted(true);
          return;
        }
        
        console.log("Got Clerk token, signing in to Supabase");
        
        // Sign in to Supabase using the Clerk token
        const { success, error: authError, message } = await signInWithClerk(token);
        
        if (!success) {
          console.error("Supabase-Clerk auth error:", authError);
          setError(authError instanceof Error ? authError : new Error(message || "Authentication failed"));
          toast({
            title: "Authentication Error",
            description: message || "Failed to connect Clerk with Supabase. Please check your Third-Party Auth configuration.",
            variant: "destructive",
          });
          setAuthenticated(false);
          setLoading(false);
          setAuthAttempted(true);
          return;
        }
        
        // Verify the session worked by checking user
        const { data, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Supabase get user error:", userError);
          setError(userError);
          toast({
            title: "Authentication Error",
            description: "Failed to verify user authentication. Please check your Clerk-Supabase integration.",
            variant: "destructive",
          });
          setAuthenticated(false);
          setLoading(false);
          setAuthAttempted(true);
          return;
        }
        
        console.log("Authentication check result:", !!data.user);
        setAuthenticated(!!data.user);
      } catch (err) {
        console.error('Error syncing auth state:', err);
        const errorInstance = err instanceof Error ? err : new Error('Authentication error');
        setError(errorInstance);
        toast({
          title: "Authentication Error",
          description: "Failed to initialize secure connection. Please check your Clerk-Supabase integration.",
          variant: "destructive",
        });
        setAuthenticated(false);
      } finally {
        setLoading(false);
        setAuthAttempted(true);
      }
    };

    syncAuthState();
  }, [userId, isSignedIn, getToken, toast]);

  return { authenticated, loading, error, authAttempted };
};

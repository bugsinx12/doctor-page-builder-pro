
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import getUUIDFromClerkID from '@/utils/getUUIDFromClerkID';
import { useToast } from '@/components/ui/use-toast';

export const useClerkSupabaseAuth = () => {
  const { userId, getToken } = useAuth();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [authAttempted, setAuthAttempted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const syncAuthState = async () => {
      if (!userId) {
        setAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Get Supabase UUID from Clerk ID
        const supabaseUserId = getUUIDFromClerkID(userId);
        
        // Get JWT token from Clerk using the Supabase template
        const token = await getToken({ template: "supabase" });
        
        if (!token) {
          const noTokenError = new Error("Failed to get authentication token");
          console.error("No JWT token available:", noTokenError);
          setError(noTokenError);
          toast({
            title: "Authentication Error",
            description: "Failed to get authentication token from Clerk. Please check your JWT template configuration.",
            variant: "destructive",
          });
          setAuthenticated(false);
          setLoading(false);
          setAuthAttempted(true);
          return;
        }
        
        console.log("Got JWT token, setting session on Supabase client");
        
        // Set the JWT on the Supabase client
        const { error: authError } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: token,
        });
        
        if (authError) {
          console.error("Supabase auth error:", authError);
          setError(authError);
          toast({
            title: "Authentication Error",
            description: "Please ensure your Clerk JWT template for Supabase is configured with the correct signing key.",
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
            description: "Failed to initialize secure connection. Please check your JWT template configuration in Clerk dashboard.",
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
          description: "Failed to initialize secure connection. Please check your JWT template configuration.",
          variant: "destructive",
        });
        setAuthenticated(false);
      } finally {
        setLoading(false);
        setAuthAttempted(true);
      }
    };

    syncAuthState();
  }, [userId, getToken, toast]);

  return { authenticated, loading, error, authAttempted };
};

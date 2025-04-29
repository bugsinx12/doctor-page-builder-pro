
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { verifyClerkTPA } from '@/integrations/supabase/client';
import getUUIDFromClerkID from '@/utils/getUUIDFromClerkID';
import { supabase } from '@/integrations/supabase/client';

export function useAuthRedirect() {
  const { isSignedIn, userId, getToken } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [authTestInProgress, setAuthTestInProgress] = useState(false);

  // Test Third-Party authentication if user is signed in
  const testTPAAuthentication = async () => {
    try {
      setAuthTestInProgress(true);
      console.log("Testing Clerk-Supabase TPA integration");
      
      // Get a token from Clerk with the supabase template
      const token = await getToken({ template: "supabase" });
      
      if (!token) {
        console.error("No Clerk token available");
        toast({
          title: "Authentication Error",
          description: "Could not get authentication token from Clerk. Please make sure your JWT template for Supabase is configured correctly.",
          variant: "destructive",
        });
        return false;
      }
      
      // Test the token with Supabase TPA integration
      const result = await verifyClerkTPA(token);
      
      console.log("TPA test result:", result);
      
      if (!result.success) {
        toast({
          title: "Authentication Warning",
          description: "Authentication check failed. This may cause issues with app functionality.",
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error testing authentication:", error);
      toast({
        title: "Authentication Error",
        description: "An unexpected error occurred testing authentication",
        variant: "destructive",
      });
      return false;
    } finally {
      setAuthTestInProgress(false);
    }
  };

  // Debug function to check if user data is being properly saved to Supabase
  const checkUserData = async (userId: string) => {
    try {
      console.log("Checking user data for Clerk ID:", userId);
      const supabaseUserId = getUUIDFromClerkID(userId);
      console.log("Converted to Supabase UUID:", supabaseUserId);
      
      // Check profiles table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", supabaseUserId)
        .maybeSingle();
        
      console.log("Profile data:", profileData, profileError);
      
      // Check subscribers table
      const { data: subscriberData, error: subscriberError } = await supabase
        .from("subscribers")
        .select("*")
        .eq("user_id", supabaseUserId)
        .maybeSingle();
        
      console.log("Subscriber data:", subscriberData, subscriberError);
    } catch (error) {
      console.error("Error checking user data:", error);
    }
  };
  
  useEffect(() => {
    if (isSignedIn && userId) {
      console.log("User is signed in with Clerk ID:", userId);
      
      const handleAuthAndRedirect = async () => {
        setAuthTestInProgress(true);
        // Test authentication
        const authWorking = await testTPAAuthentication();
        
        // Even if auth failed, still check user data for debugging
        await checkUserData(userId);
        
        // Only redirect if authentication is working
        if (authWorking) {
          navigate("/onboarding", { replace: true });
        } else {
          // Show a more visible error to the user
          toast({
            title: "Authentication Error",
            description: "There was a problem connecting Clerk with Supabase. Please check your Third-Party Auth configuration.",
            variant: "destructive",
          });
        }
        setAuthTestInProgress(false);
      };
      
      handleAuthAndRedirect();
    }
  }, [isSignedIn, userId, navigate, toast]);

  return {
    isSignedIn,
    userId,
    authTestInProgress
  };
}

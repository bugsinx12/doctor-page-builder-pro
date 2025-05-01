
import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { supabase, verifyClerkTPA, debugSessionInfo } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, Info, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AuthenticationTestProps {
  userId?: string | null;
}

const AuthenticationTest = ({ userId }: AuthenticationTestProps) => {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [authTestInProgress, setAuthTestInProgress] = useState(false);
  const [authSuccess, setAuthSuccess] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  // Test TPA authentication
  const testTPAAuthentication = async () => {
    try {
      setAuthTestInProgress(true);
      console.log("Testing Clerk-Supabase TPA integration");
      
      // Get a token from Clerk for Supabase TPA - no template needed for TPA
      const token = await getToken();
      
      if (!token) {
        console.error("No Clerk token available");
        setAuthSuccess(false);
        setAuthError("Could not get authentication token from Clerk. Make sure Third-Party Authentication is enabled for Supabase in your Clerk dashboard.");
        return false;
      }
      
      // Test the token with Supabase TPA integration
      const result = await verifyClerkTPA(token);
      
      if (!result.success) {
        console.error("TPA auth error:", result.error);
        setAuthSuccess(false);
        setAuthError(result.message);
        toast({
          title: "Authentication Warning",
          description: "TPA authentication failed. This may cause issues with app functionality.",
          variant: "destructive",
        });
        return false;
      }
      
      // Get detailed session information
      const sessionInfo = await debugSessionInfo();
      
      if (sessionInfo.success && sessionInfo.user) {
        setUserInfo({
          id: sessionInfo.user.id,
          email: sessionInfo.user.email,
          clerkId: sessionInfo.user.user_metadata?.clerk_id || sessionInfo.user.user_metadata?.sub,
          metadata: sessionInfo.user.user_metadata || {},
          provider: "clerk"
        });
        
        setAuthSuccess(true);
        toast({
          title: "Authentication Success",
          description: "Clerk-Supabase TPA integration is working correctly.",
        });
        return true;
      } else {
        setAuthSuccess(false);
        setAuthError("User information not available after authentication");
        return false;
      }
    } catch (error) {
      console.error("Error testing authentication:", error);
      setAuthSuccess(false);
      setAuthError("An unexpected error occurred testing authentication");
      return false;
    } finally {
      setAuthTestInProgress(false);
    }
  };
  
  // Debug function to check user data in database
  const checkUserData = async () => {
    try {
      if (!userId) return;
      
      console.log("Checking user data for Clerk ID:", userId);
      
      // Check profiles table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
        
      console.log("Profile data:", profileData, profileError);
      
      // Check subscribers table
      const { data: subscriberData, error: subscriberError } = await supabase
        .from("subscribers")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
        
      console.log("Subscriber data:", subscriberData, subscriberError);
      
      // Check tasks table - using sub claim from JWT
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .maybeSingle();
        
      console.log("Task data:", tasksData, tasksError);
      
      return {
        profile: profileData,
        subscriber: subscriberData,
        tasks: tasksData,
        errors: { profile: profileError, subscriber: subscriberError, tasks: tasksError }
      };
    } catch (error) {
      console.error("Error checking user data:", error);
      return { error };
    }
  };

  return (
    <>
      {authTestInProgress && (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-medical-600" />
          <span className="ml-2 text-sm text-gray-600">Verifying authentication...</span>
        </div>
      )}
      
      {authSuccess === true && (
        <Alert variant="default" className="mb-4 border-green-500">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-600">Authentication Success</AlertTitle>
          <AlertDescription>
            Your Clerk-Supabase TPA integration is configured correctly.
            {userInfo && (
              <div className="mt-2 text-xs">
                <p>Supabase User ID: {userInfo.id}</p>
                <p>Clerk ID: {userInfo.clerkId || 'Unknown'}</p>
                <p>Email: {userInfo.email}</p>
                <p>Provider: {userInfo.provider}</p>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {authSuccess === false && authError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      )}

      <Alert variant="default" className="mb-4">
        <Info className="h-4 w-4" />
        <AlertTitle>Third-Party Authentication</AlertTitle>
        <AlertDescription>
          <p className="mb-2">Make sure you have:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Enabled Supabase as a Third-Party Authentication provider in your Clerk Dashboard.</li>
            <li>Added 'clerk' to the list of External OAuth providers in your Supabase project settings.</li>
            <li>Copied your Supabase URL and anon key to the Clerk provider configuration.</li>
          </ol>
        </AlertDescription>
        <div className="mt-2 space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('https://clerk.com/docs/integrations/databases/supabase', '_blank')}
          >
            View Clerk-Supabase Docs
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={testTPAAuthentication}
          >
            Test TPA Auth
          </Button>
          {userId && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setShowDebug(!showDebug);
                if (!showDebug) {
                  checkUserData();
                }
              }}
            >
              {showDebug ? "Hide Debug Info" : "Show Debug Info"}
            </Button>
          )}
        </div>
      </Alert>
    </>
  );
};

export default AuthenticationTest;

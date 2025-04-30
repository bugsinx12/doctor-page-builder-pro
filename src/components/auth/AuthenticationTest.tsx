
import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { supabase, verifyJWTAuth } from "@/integrations/supabase/client";
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
  const [jwtClaims, setJwtClaims] = useState<any>(null);

  // Test JWT authentication
  const testJWTAuthentication = async () => {
    try {
      setAuthTestInProgress(true);
      console.log("Testing Clerk JWT integration");
      
      // Get a JWT token from Clerk
      const token = await getToken({
        template: "supabase-jwt"
      });
      
      if (!token) {
        console.error("No Clerk token available");
        setAuthSuccess(false);
        setAuthError("Could not get authentication token from Clerk. Please make sure JWT template is enabled for Supabase in your Clerk dashboard.");
        return false;
      }
      
      // Test the token with Supabase JWT auth
      const result = await verifyJWTAuth(token);
      
      if (!result.success) {
        console.error("JWT auth error:", result.error);
        setAuthSuccess(false);
        setAuthError(result.message);
        toast({
          title: "Authentication Warning",
          description: "JWT authentication failed. This may cause issues with app functionality.",
          variant: "destructive",
        });
        return false;
      }
      
      // Display JWT claims
      if (result.jwtClaims) {
        setJwtClaims(result.jwtClaims);
        setAuthSuccess(true);
        
        toast({
          title: "Authentication Success",
          description: "Clerk JWT integration is working correctly.",
        });
        return true;
      } else {
        setAuthSuccess(false);
        setAuthError("JWT claims not available after authentication");
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
      
      // Check tasks table
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
            Your Clerk JWT integration is configured correctly.
            {jwtClaims && (
              <div className="mt-2 text-xs">
                <p>JWT 'sub' claim: {jwtClaims.sub}</p>
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
        <AlertTitle>JWT Authentication</AlertTitle>
        <AlertDescription>
          Make sure you've configured the JWT template in your Clerk dashboard with 'sub' claim mapping to user ID.
        </AlertDescription>
        <div className="mt-2 space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('https://clerk.com/docs/backend-requests/making/custom-jwt-templates', '_blank')}
          >
            View Clerk JWT Docs
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={testJWTAuthentication}
          >
            Test JWT Auth
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

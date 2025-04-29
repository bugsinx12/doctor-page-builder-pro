
import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { verifyClerkTPA } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, Info, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import getUUIDFromClerkID from "@/utils/getUUIDFromClerkID";
import { supabase } from "@/integrations/supabase/client";

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

  // Test Third-Party authentication if user is signed in
  const testTPAAuthentication = async () => {
    try {
      setAuthTestInProgress(true);
      console.log("Testing Clerk-Supabase TPA integration");
      
      // Get a token from Clerk for Supabase - using plain getToken() for TPA
      const token = await getToken();
      
      if (!token) {
        console.error("No Clerk token available");
        setAuthSuccess(false);
        setAuthError("Could not get authentication token from Clerk. Please make sure Third-Party Authentication is enabled for Supabase in your Clerk dashboard.");
        return false;
      }
      
      // Test the token with Supabase TPA integration
      const result = await verifyClerkTPA(token);
      
      console.log("TPA test result:", result);
      
      setAuthSuccess(result.success);
      if (!result.success) {
        setAuthError(result.message || "Unknown authentication error");
        toast({
          title: "Authentication Warning",
          description: "Authentication check failed. This may cause issues with app functionality.",
          variant: "destructive",
        });
        return false;
      } else {
        toast({
          title: "Authentication Success",
          description: "Clerk-Supabase integration is working correctly.",
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error testing authentication:", error);
      setAuthSuccess(false);
      setAuthError("An unexpected error occurred testing authentication");
      return false;
    } finally {
      setAuthTestInProgress(false);
    }
  };
  
  // Debug function to check if user data is being properly saved to Supabase
  const checkUserData = async (userId: string) => {
    try {
      if (!userId) return;
      
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
      
      return {
        profile: profileData,
        subscriber: subscriberData,
        errors: { profile: profileError, subscriber: subscriberError }
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
            Your Clerk-Supabase Third-Party Authentication is configured correctly.
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
        <AlertTitle>Important Setup</AlertTitle>
        <AlertDescription>
          Make sure you've configured Third-Party Authentication for Clerk in your Supabase dashboard and enabled the Supabase integration in your Clerk dashboard.
        </AlertDescription>
        <div className="mt-2 space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('https://clerk.com/docs/integrations/databases/supabase', '_blank')}
          >
            View Documentation
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={testTPAAuthentication}
          >
            Test Authentication
          </Button>
          {userId && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setShowDebug(!showDebug);
                if (!showDebug && userId) {
                  checkUserData(userId);
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

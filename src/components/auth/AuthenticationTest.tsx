
import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, Info, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuthenticatedSupabase } from "@/hooks/useAuthenticatedSupabase";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";

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
  const { client: authClient, isAuthenticated } = useAuthenticatedSupabase();

  // Test Clerk integration with Supabase
  const testClerkTPAAuthentication = async (token: string) => {
    console.log("Testing Clerk-Supabase integration with token");
    
    try {
      // Try to access a protected resource by making a manual fetch with the token
      const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`, {
        headers: {
          'apikey': SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorMessage = await response.text();
        console.error("Authentication error:", errorMessage);
        return { success: false, message: `Authentication failed: ${response.statusText}` };
      }
      
      const data = await response.json();
      console.log("Authentication successful:", data);
      return { success: true, message: "Authentication successful" };
    } catch (error) {
      console.error("Authentication error:", error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Unknown authentication error" 
      };
    }
  };

  // Get debug session info
  const debugSessionInfo = async () => {
    try {
      const { data, error } = await authClient.auth.getSession();
      
      if (error || !data.session) {
        return { success: false, error };
      }
      
      return { 
        success: true, 
        user: data.session.user,
        session: data.session 
      };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Test authentication
  const testAuthentication = async () => {
    try {
      setAuthTestInProgress(true);
      console.log("Testing Clerk-Supabase integration");
      
      // Get a default token from Clerk without specifying a template
      const token = await getToken();
      
      if (!token) {
        console.error("No Clerk token available");
        setAuthSuccess(false);
        setAuthError("Could not get authentication token from Clerk");
        return false;
      }
      
      // Test integration
      const authResult = await testClerkTPAAuthentication(token);
      
      if (!authResult.success) {
        console.error("Auth error:", authResult.message);
        setAuthSuccess(false);
        setAuthError(authResult.message);
        toast({
          title: "Authentication Warning",
          description: "Authentication failed. This may cause issues with app functionality.",
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
          description: "Clerk-Supabase integration is working correctly.",
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
            Your Clerk-Supabase integration is configured correctly.
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
        <AlertTitle>Authentication</AlertTitle>
        <AlertDescription>
          <p className="mb-2">Using Clerk authentication with Supabase without a JWT template.</p>
          <p className="mb-2">For production environments, you should:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Create a JWT Template named 'supabase' in your Clerk Dashboard to improve security.</li>
            <li>Configure Row Level Security (RLS) policies in Supabase to protect your data.</li>
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
            onClick={testAuthentication}
          >
            Test Auth
          </Button>
        </div>
      </Alert>
    </>
  );
};

export default AuthenticationTest;

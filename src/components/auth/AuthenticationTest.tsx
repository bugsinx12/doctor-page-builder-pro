
import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, Info, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuthenticatedSupabase } from "@/hooks/useAuthenticatedSupabase";
import { createClient } from '@supabase/supabase-js';

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

  // Get an authenticated Supabase client with a token
  const getAuthenticatedClient = (token: string) => {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://isjjzddntanbjopqylic.supabase.co";
    const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlzamp6ZGRudGFuYmpvcHF5bGljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NzEyMDAsImV4cCI6MjA2MDE0NzIwMH0._Y8ux53LbbT5aAVAyHJduvMGvHuBmKD34fU6xktyjR8";
    
    return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        persistSession: false,
      },
    });
  };

  // Test TPA integration with Clerk
  const testClerkTPAAuthentication = async (token: string) => {
    console.log("Testing Clerk-Supabase TPA integration with token");
    
    try {
      const client = getAuthenticatedClient(token);
      
      // Try to access a protected resource
      const { data, error } = await client
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error("TPA authentication error:", error);
        return { success: false, message: error.message };
      }
      
      console.log("TPA authentication successful:", data);
      return { success: true, message: "Authentication successful" };
    } catch (error) {
      console.error("TPA authentication error:", error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Unknown authentication error" 
      };
    }
  };

  // Get debug session info
  const debugSessionInfo = async (client: any) => {
    try {
      const { data: { user, session }, error } = await client.auth.getSession();
      
      if (error || !user) {
        return { success: false, error };
      }
      
      return { success: true, user, session };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Test authentication
  const testAuthentication = async () => {
    try {
      setAuthTestInProgress(true);
      console.log("Testing Clerk-Supabase TPA integration");
      
      // Get a token from Clerk for Supabase using the 'supabase' template
      const token = await getToken({ template: 'supabase' });
      
      if (!token) {
        console.error("No Clerk token available");
        setAuthSuccess(false);
        setAuthError("Could not get authentication token from Clerk. Make sure Third-Party Authentication is enabled for Supabase in your Clerk dashboard.");
        return false;
      }
      
      // Test TPA integration
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
      
      // Get detailed session information with the authenticated client
      const client = getAuthenticatedClient(token);
      const sessionInfo = await debugSessionInfo(client);
      
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
            <li>Created a JWT Template named 'supabase' in your Clerk Dashboard with the correct signing key.</li>
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
            Test TPA Auth
          </Button>
        </div>
      </Alert>
    </>
  );
};

export default AuthenticationTest;

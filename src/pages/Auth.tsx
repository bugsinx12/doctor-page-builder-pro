
import { SignIn, SignUp } from "@clerk/clerk-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import getUUIDFromClerkID from "@/utils/getUUIDFromClerkID";
import { supabase, signInWithClerk, verifyClerkTPA } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "login";
  const templateId = searchParams.get("template");
  const { isSignedIn, userId, getToken } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [authTestInProgress, setAuthTestInProgress] = useState(false);
  const [authSuccess, setAuthSuccess] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Test Third-Party authentication if user is signed in
  const testTPAAuthentication = async () => {
    try {
      setAuthTestInProgress(true);
      console.log("Testing Clerk-Supabase TPA integration");
      
      // Get a token from Clerk with the supabase template
      const token = await getToken({ template: "supabase" });
      
      if (!token) {
        console.error("No Clerk token available");
        setAuthSuccess(false);
        setAuthError("Could not get authentication token from Clerk. Please make sure your JWT template for Supabase is configured correctly.");
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
  
  // Redirect to onboarding if already signed in
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <Tabs defaultValue={defaultTab}>
          <CardHeader>
            <CardTitle className="text-center">Welcome to Boost.Doctor</CardTitle>
            <CardDescription className="text-center">Sign in to your account or create a new one</CardDescription>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <CardContent>
            {authTestInProgress && (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-medical-600" />
                <span className="ml-2 text-sm text-gray-600">Verifying authentication...</span>
              </div>
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
                Make sure you've configured Third-Party Authentication for Clerk in your Supabase dashboard and set up the JWT template named 'supabase' in your Clerk dashboard.
              </AlertDescription>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => window.open('https://clerk.com/docs/integrations/databases/supabase', '_blank')}
              >
                View Documentation
              </Button>
            </Alert>
            
            <TabsContent value="login">
              <SignIn 
                signUpUrl={`/auth?tab=signup${templateId ? `&template=${templateId}` : ''}`}
                redirectUrl="/onboarding"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "w-full shadow-none p-0",
                    form: "w-full",
                    formButtonPrimary: "bg-medical-600 hover:bg-medical-700",
                    formFieldInput: "border-gray-300 focus:border-medical-500 focus:ring-medical-500",
                    identityPreviewEditButton: "text-medical-600",
                    footerActionLink: "text-medical-600 hover:text-medical-700",
                  }
                }}
              />
            </TabsContent>
            
            <TabsContent value="signup">
              <SignUp 
                signInUrl={`/auth?tab=login${templateId ? `&template=${templateId}` : ''}`}
                redirectUrl="/onboarding"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "w-full shadow-none p-0",
                    form: "w-full",
                    formButtonPrimary: "bg-medical-600 hover:bg-medical-700",
                    formFieldInput: "border-gray-300 focus:border-medical-500 focus:ring-medical-500",
                    identityPreviewEditButton: "text-medical-600",
                    footerActionLink: "text-medical-600 hover:text-medical-700",
                    otpCodeFieldInput: "border-gray-300 focus:border-medical-500 focus:ring-medical-500",
                  }
                }}
              />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;

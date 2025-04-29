
import { SignIn, SignUp } from "@clerk/clerk-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import getUUIDFromClerkID from "@/utils/getUUIDFromClerkID";
import { supabase, signInWithClerk, verifyAuthentication } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
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
  const [jwtTemplateChecked, setJwtTemplateChecked] = useState(false);
  const [jwtTemplateExists, setJwtTemplateExists] = useState<boolean | null>(null);
  
  // Test if the JWT template exists
  const checkJwtTemplate = async () => {
    try {
      setAuthTestInProgress(true);
      
      // Attempt to get token with the supabase template
      const token = await getToken({ template: "supabase" });
      
      // If we get a token, the template exists
      setJwtTemplateExists(!!token);
      setJwtTemplateChecked(true);
      
      if (!token) {
        setAuthError("Supabase JWT template not found in Clerk. Please make sure you've added the JWT template named 'supabase' in your Clerk dashboard.");
      }
      
      return !!token;
    } catch (err) {
      console.error("Error checking JWT template:", err);
      setJwtTemplateExists(false);
      setAuthError("Error checking JWT template. Please make sure you've added the JWT template named 'supabase' in your Clerk dashboard.");
      return false;
    } finally {
      setAuthTestInProgress(false);
    }
  };
  
  // Test Third-Party authentication if user is signed in
  const testAuthentication = async (userId: string) => {
    try {
      setAuthTestInProgress(true);
      console.log("Testing Clerk-Supabase TPA integration for user:", userId);
      
      // First check if the JWT template exists
      const templateExists = await checkJwtTemplate();
      
      if (!templateExists) {
        return false;
      }
      
      // Get a token from Clerk with the supabase template
      const token = await getToken({ template: "supabase" });
      
      if (!token) {
        console.error("No Clerk token available");
        setAuthSuccess(false);
        setAuthError("Could not get authentication token from Clerk. Please make sure your JWT template is configured correctly.");
        return false;
      }
      
      // Test the token with Supabase TPA integration
      const result = await verifyAuthentication(token);
      
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
        const authWorking = await testAuthentication(userId);
        
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
            
            {jwtTemplateChecked && !jwtTemplateExists && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>JWT Template Missing</AlertTitle>
                <AlertDescription>
                  You need to create a JWT template named "supabase" in your Clerk dashboard. Follow the instructions in the 
                  <a href="https://supabase.com/docs/guides/auth/third-party/clerk" className="underline ml-1" target="_blank" rel="noopener noreferrer">
                    Supabase-Clerk integration docs
                  </a>.
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

            <Alert variant="info" className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Important Setup</AlertTitle>
              <AlertDescription>
                Make sure you've configured the Clerk JWT template for Supabase. It should have the signing key: 
                "supabase_jwt_7X9z2K#mQ5$pL3@fN6!wR8*tJ4" and include the 'email' and 'role' claims.
              </AlertDescription>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => window.open('https://supabase.com/docs/guides/auth/third-party/clerk', '_blank')}
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

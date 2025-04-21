import { SignIn, SignUp } from "@clerk/clerk-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import getUUIDFromClerkID from "@/utils/getUUIDFromClerkID";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "login";
  const templateId = searchParams.get("template");
  const { isSignedIn, userId } = useAuth();
  const navigate = useNavigate();
  
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
      checkUserData(userId);
      navigate("/onboarding", { replace: true });
    }
  }, [isSignedIn, userId, navigate]);

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

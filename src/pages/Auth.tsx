
import { SignIn, SignUp } from "@clerk/clerk-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "login";
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirect to dashboard if already signed in
  useEffect(() => {
    if (isSignedIn) {
      navigate("/dashboard", { replace: true });
    }
  }, [isSignedIn, navigate]);

  // Don't redirect if we're in the verification flow
  const isVerificationFlow = location.pathname.includes('verify');

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
                routing="path"
                path="/sign-in"
                signUpUrl="/sign-up"
                afterSignInUrl="/dashboard"
                redirectUrl="/dashboard"
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
                routing="path"
                path="/sign-up"
                signInUrl="/sign-in"
                afterSignUpUrl="/dashboard"
                redirectUrl="/dashboard"
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

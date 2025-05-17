
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams, useNavigate } from "react-router-dom";
import AuthTabs from "@/components/auth/AuthTabs";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "login";
  const templateId = searchParams.get("template");
  const navigate = useNavigate();
  const { session, isLoading } = useAuth();

  // Redirect to onboarding if user is already signed in
  useEffect(() => {
    if (session && !isLoading) {
      navigate("/onboarding", { replace: true });
    }
  }, [session, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Welcome to Boost.Doctor</CardTitle>
          <CardDescription className="text-center">Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        
        <CardContent>
          <AuthTabs 
            defaultTab={defaultTab} 
            templateId={templateId} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";
import AuthTabs from "@/components/auth/AuthTabs";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "login";
  const templateId = searchParams.get("template");
  const { isSignedIn, userId, authTestInProgress } = useAuthRedirect();

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
            userId={userId} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;

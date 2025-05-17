
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import AuthTabs from "@/components/auth/AuthTabs";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "login";
  const templateId = searchParams.get("template");
  const navigate = useNavigate();
  const { session, isLoading, user } = useAuth();
  const location = useLocation();
  const [verificationResult, setVerificationResult] = useState<{success?: boolean; message?: string}>({});
  const [processingVerification, setProcessingVerification] = useState(false);

  // Check if we're returning from email verification
  useEffect(() => {
    // Extract hash params from URL if present (from email verification)
    const hashParams = new URLSearchParams(location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");
    const type = hashParams.get("type");

    const isVerificationFlow = type === "signup" || type === "recovery" || hashParams.has("error_description");
    
    if (isVerificationFlow) {
      setProcessingVerification(true);
      
      if (hashParams.has("error_description")) {
        setVerificationResult({ 
          success: false, 
          message: decodeURIComponent(hashParams.get("error_description") || "Verification failed")
        });
        setProcessingVerification(false);
        return;
      }
      
      if (accessToken && refreshToken) {
        // Let the system handle the tokens - Supabase will pick these up automatically
        console.log("Email verification successful, tokens in URL");
        setVerificationResult({ 
          success: true, 
          message: "Email verified successfully! You can now log in."
        });
        
        // Clean up the URL
        if (history.replaceState) {
          history.replaceState(null, '', location.pathname);
        }
      }
      setProcessingVerification(false);
    }
  }, [location]);

  // Redirect to onboarding if user is already signed in
  useEffect(() => {
    if (session && !isLoading && !processingVerification) {
      navigate("/onboarding", { replace: true });
    }
  }, [session, isLoading, navigate, processingVerification]);

  if (isLoading || processingVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-medical-600" />
          <p className="mt-4 text-gray-600">
            {processingVerification ? "Verifying your account..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Welcome to Boost.Doctor</CardTitle>
          <CardDescription className="text-center">Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        
        <CardContent>
          {verificationResult.message && (
            <Alert variant={verificationResult.success ? "default" : "destructive"} className="mb-4">
              <AlertDescription>{verificationResult.message}</AlertDescription>
            </Alert>
          )}
          
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


import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useAuth } from '@/contexts/AuthContext';

interface AuthenticationTestProps {
  userId?: string | null;
}

const AuthenticationTest: React.FC<AuthenticationTestProps> = ({ userId }) => {
  const { isAuthenticated, isLoading, error } = useSupabaseAuth();
  const [showStatus, setShowStatus] = useState(false);
  const { user } = useAuth(); // Use our custom AuthContext

  useEffect(() => {
    // Only show the status message after a brief delay
    const timer = setTimeout(() => {
      setShowStatus(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (!showStatus || isLoading) {
    return null;
  }
  
  // Only show the test component if we have a userId
  const currentUserId = userId || user?.id;
  if (!currentUserId) {
    return null;
  }

  return (
    <>
      {isAuthenticated && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-700">Authentication Successful</AlertTitle>
          <AlertDescription className="text-green-600">
            Your authentication is working properly.
          </AlertDescription>
        </Alert>
      )}

      {!isAuthenticated && !error && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Status</AlertTitle>
          <AlertDescription>
            You are signed in but not yet authenticated with Supabase.
          </AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert className="mb-4 bg-red-50 border-red-200">
          <XCircle className="h-4 w-4 text-red-500" />
          <AlertTitle className="text-red-700">Authentication Error</AlertTitle>
          <AlertDescription className="text-red-600">
            {error.message || "Failed to authenticate. Please check your configuration."}
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default AuthenticationTest;

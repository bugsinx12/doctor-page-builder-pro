
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WebsiteAuthErrorProps {
  error: Error | null;
  onRetryAuth: () => Promise<void>;
  isAuthenticated: boolean;
}

const WebsiteAuthError: React.FC<WebsiteAuthErrorProps> = ({
  error,
  onRetryAuth,
  isAuthenticated
}) => {
  if (!error && isAuthenticated) return null;
  
  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            Make sure your Clerk-Supabase Third-Party Authentication is properly configured.
            <Button 
              variant="outline" 
              className="mt-2 mr-2"
              onClick={onRetryAuth}
            >
              Retry Authentication
            </Button>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => window.open('https://clerk.com/docs/integrations/databases/supabase', '_blank')}
            >
              View Documentation
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {!error && !isAuthenticated && (
        <Alert variant="default" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You are signed in with Clerk but not authenticated with Supabase. Please check your Third-Party Auth configuration.
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={onRetryAuth}
            >
              Retry Authentication
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default WebsiteAuthError;

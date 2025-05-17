
import React from 'react';
import { Button } from '@/components/ui/button';

interface AuthenticationErrorProps {
  onRetry: () => void;
  onSignOut: () => void;
}

const AuthenticationError = ({ onRetry, onSignOut }: AuthenticationErrorProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-6">
            We couldn't connect securely to our database. Please ensure you have a valid session.
          </p>
          <div className="space-y-4">
            <Button onClick={onRetry} className="w-full">
              Retry Connection
            </Button>
            <Button onClick={onSignOut} variant="outline" className="w-full">
              Sign Out
            </Button>
          </div>
          <div className="mt-6 text-sm text-gray-500">
            <p>If the problem persists, please check your connection or contact support.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationError;

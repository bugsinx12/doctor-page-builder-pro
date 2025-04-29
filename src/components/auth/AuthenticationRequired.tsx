
import React from 'react';
import { Button } from '@/components/ui/button';

interface AuthenticationRequiredProps {
  onLoginClick: () => void;
}

const AuthenticationRequired = ({ onLoginClick }: AuthenticationRequiredProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to access this page.
          </p>
          <Button onClick={onLoginClick}>
            Go to Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationRequired;


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Onboarding from '@/components/onboarding/Onboarding';
import { Shell } from '@/components/Shell';
import { useClerkSupabaseAuth } from '@/hooks/useClerkSupabaseAuth';
import LoadingSpinner from '@/components/ui/loading-spinner';
import AuthenticationError from '@/components/auth/AuthenticationError';
import AuthenticationRequired from '@/components/auth/AuthenticationRequired';
import InitializeUserProfile from '@/components/onboarding/InitializeUserProfile';
import OnboardingController from '@/components/onboarding/OnboardingController';

const OnboardingPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, isLoading: authLoading, error: authError, authAttempted, refreshAuth } = useClerkSupabaseAuth();
  
  // When authentication verification is complete, update loading state
  useState(() => {
    if (!authLoading && authAttempted) {
      setLoading(false);
    }
  });
  
  const handleOnboardingComplete = () => {
    navigate('/dashboard', { replace: true });
  };

  const handleRetryAuth = async () => {
    await refreshAuth();
  };
  
  const handleSignOut = async () => {
    try {
      await user?.delete();
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error("Error signing out:", error);
      navigate('/auth', { replace: true });
    }
  };
  
  // Authentication error screen
  if (!authLoading && !isAuthenticated && authAttempted) {
    return (
      <Shell>
        <AuthenticationError 
          onRetry={handleRetryAuth} 
          onSignOut={handleSignOut} 
        />
      </Shell>
    );
  }
  
  // Loading screen
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner size={12} />
      </div>
    );
  }
  
  // Initialize user profile if authenticated
  if (isAuthenticated) {
    return (
      <Shell>
        <InitializeUserProfile isAuthenticated={isAuthenticated} isLoading={loading} />
        <OnboardingController authenticated={isAuthenticated}>
          <Onboarding onComplete={handleOnboardingComplete} />
        </OnboardingController>
      </Shell>
    );
  }
  
  // Fallback for other authentication issues
  return (
    <Shell>
      <AuthenticationRequired onLoginClick={() => navigate('/auth')} />
    </Shell>
  );
};

export default OnboardingPage;

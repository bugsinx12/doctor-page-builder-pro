
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Onboarding from '@/components/onboarding/Onboarding';
import { Shell } from '@/components/Shell';
import LoadingSpinner from '@/components/ui/loading-spinner';
import AuthenticationError from '@/components/auth/AuthenticationError';
import AuthenticationRequired from '@/components/auth/AuthenticationRequired';
import InitializeUserProfile from '@/components/onboarding/InitializeUserProfile';
import OnboardingController from '@/components/onboarding/OnboardingController';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const OnboardingPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check authentication
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        // Test authentication with a simple query
        const { error } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
          
        if (error && !error.message.includes('No rows found')) {
          throw error;
        }

        setIsAuthenticated(true);
        setAuthError(null);
      } catch (err) {
        console.error("Error verifying auth:", err);
        setAuthError(err instanceof Error ? err : new Error("Failed to authenticate with Supabase"));
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [user]);
  
  const handleOnboardingComplete = () => {
    navigate('/dashboard', { replace: true });
  };

  const handleRetryAuth = async () => {
    setLoading(true);
    try {
      // Refresh the session
      const { error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      setAuthError(null);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error refreshing auth:", error);
      setAuthError(error instanceof Error ? error : new Error("Failed to refresh authentication"));
    } finally {
      setLoading(false);
    }
  };
  
  // Authentication error screen
  if (!loading && !isAuthenticated) {
    return (
      <Shell>
        <AuthenticationError 
          onRetry={handleRetryAuth} 
          onSignOut={signOut} 
        />
      </Shell>
    );
  }
  
  // Loading screen
  if (loading) {
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
        <InitializeUserProfile 
          isAuthenticated={isAuthenticated} 
          isLoading={loading} 
          userId={user?.id || ''} 
        />
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

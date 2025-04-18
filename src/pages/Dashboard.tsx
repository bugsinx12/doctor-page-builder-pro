
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Onboarding from '@/components/onboarding/Onboarding';
import { useToast } from '@/components/ui/use-toast';

const Dashboard = () => {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Only proceed when both auth states are loaded
    if (!isAuthLoaded || !isUserLoaded) {
      return;
    }

    // Check if user is signed in
    if (!isSignedIn || !user) {
      navigate('/auth');
      return;
    }

    // Authentication check is complete
    setIsCheckingAuth(false);

    // Check onboarding status from metadata
    const hasCompleted = user.unsafeMetadata?.onboardingCompleted as boolean;
    setHasCompletedOnboarding(hasCompleted || false);
    
    // Show welcome toast
    if (user.firstName) {
      toast({
        title: `Welcome back, ${user.firstName}!`,
        description: "Great to see you again.",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "Great to see you again.",
      });
    }
  }, [isAuthLoaded, isUserLoaded, isSignedIn, user, navigate, toast]);

  // Show loading state while checking authentication
  if (isCheckingAuth || !isAuthLoaded || !isUserLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medical-600"></div>
      </div>
    );
  }

  // User is not signed in
  if (!isSignedIn || !user) {
    return null; // Will be redirected by the useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {!hasCompletedOnboarding ? (
          <Onboarding onComplete={() => setHasCompletedOnboarding(true)} />
        ) : (
          <div className="container py-12">
            <h1 className="text-3xl font-bold mb-6">Your Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Your Website</h2>
                <p className="text-gray-600 mb-4">
                  View and manage your medical website.
                </p>
                <button 
                  className="text-medical-600 font-medium"
                  onClick={() => navigate('/website-editor')}
                >
                  Manage Website →
                </button>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Your Subscription</h2>
                <p className="text-gray-600 mb-4">
                  Manage your subscription and billing information.
                </p>
                <button 
                  className="text-medical-600 font-medium"
                  onClick={() => navigate('/subscription')}
                >
                  Manage Subscription →
                </button>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Analytics</h2>
                <p className="text-gray-600 mb-4">
                  View your website traffic and analytics.
                </p>
                <button 
                  className="text-medical-600 font-medium"
                  onClick={() => navigate('/analytics')}
                >
                  View Analytics →
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;

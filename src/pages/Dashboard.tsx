
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Onboarding from '@/components/onboarding/Onboarding';
import { useToast } from '@/components/ui/use-toast';

const Dashboard = () => {
  const { user, isLoaded } = useUser();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isLoaded && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      // Check if user has completed onboarding based on metadata
      const hasCompleted = user.unsafeMetadata?.onboardingCompleted as boolean;
      setHasCompletedOnboarding(hasCompleted || false);
      
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
    }
  }, [isLoaded, user, navigate, toast]);

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medical-600"></div>
      </div>
    );
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


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Onboarding from '@/components/onboarding/Onboarding';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowUpCircle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user, isLoaded } = useUser();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [subscription, setSubscription] = useState<{ subscribed: boolean; subscription_tier?: string } | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    
    // User is guaranteed to be signed in here due to ProtectedRoute
    console.log("Dashboard - User is signed in:", user?.id);
    
    // Check onboarding status
    const hasCompleted = user?.unsafeMetadata?.onboardingCompleted as boolean;
    setHasCompletedOnboarding(hasCompleted || false);
    
    // Welcome message
    if (user?.firstName) {
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
    
    // Check subscription status if onboarding is complete
    if (hasCompleted) {
      checkSubscription();
    } else {
      setIsLoadingSubscription(false);
    }
    
    // Loading complete
    setLoading(false);
  }, [isLoaded, user, toast]);

  const checkSubscription = async () => {
    try {
      setIsLoadingSubscription(true);
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error("Error checking subscription:", error);
        toast({
          title: "Error",
          description: "Could not check subscription status.",
          variant: "destructive"
        });
      } else {
        setSubscription(data);
        console.log("Subscription data:", data);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: 'pro' },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Could not start upgrade process. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Show loading state
  if (loading || !isLoaded) {
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
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Your Dashboard</h1>
              {subscription && !subscription.subscribed && (
                <Button 
                  onClick={handleUpgrade}
                  className="bg-medical-600 hover:bg-medical-700"
                >
                  <ArrowUpCircle className="mr-2 h-4 w-4" />
                  Upgrade to Pro
                </Button>
              )}
            </div>
            
            {isLoadingSubscription ? (
              <div className="my-4 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-medical-600"></div>
                <p className="text-gray-500 mt-2">Checking subscription status...</p>
              </div>
            ) : subscription?.subscribed ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-700 font-medium">
                  You are currently on the {subscription.subscription_tier || 'Premium'} plan.
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-700">
                  You are currently on the Free plan. Upgrade to access premium features.
                </p>
              </div>
            )}
            
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
                  onClick={() => navigate('/pricing')}
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

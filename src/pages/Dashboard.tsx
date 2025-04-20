
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Onboarding from '@/components/onboarding/Onboarding';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowUpCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Dashboard = () => {
  const { user, isLoaded } = useUser();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [subscription, setSubscription] = useState<{ subscribed: boolean; subscription_tier?: string } | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [upgradingPlan, setUpgradingPlan] = useState(false);

  // Check if we just came back from Stripe checkout
  const checkForStripeRedirect = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const stripeSuccess = urlParams.get('payment') === 'success';
    const stripeCancel = urlParams.get('payment') === 'cancel';
    
    if (stripeSuccess) {
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      toast({
        title: "Payment successful!",
        description: "Your subscription has been activated. Refreshing your subscription status...",
        variant: "default",
      });
      
      // Force refresh subscription status after a short delay
      setTimeout(() => {
        checkSubscription();
      }, 1000);
      
      return true;
    } else if (stripeCancel) {
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      toast({
        title: "Payment cancelled",
        description: "Your subscription has not been changed.",
        variant: "default",
      });
      
      return true;
    }
    
    return false;
  };

  useEffect(() => {
    if (!isLoaded) return;
    
    // User is guaranteed to be signed in here due to ProtectedRoute
    console.log("Dashboard - User is signed in:", user?.id);
    
    // Check onboarding status
    const hasCompleted = user?.unsafeMetadata?.onboardingCompleted as boolean;
    setHasCompletedOnboarding(hasCompleted || false);
    
    // Check if we just came back from Stripe
    const isStripeRedirect = checkForStripeRedirect();
    
    // Welcome message - only show if not redirected from Stripe
    if (!isStripeRedirect) {
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

  // Create auth data for Supabase edge functions
  const getAuthToken = () => {
    if (!user) return null;
    
    // Create an auth token that includes the necessary user info
    const authData = {
      userId: user.id,
      userEmail: user.primaryEmailAddress?.emailAddress
    };
    
    // Base64 encode the data
    return `Bearer ${btoa(JSON.stringify(authData))}`;
  };

  const checkSubscription = async () => {
    try {
      setIsLoadingSubscription(true);
      setSubscriptionError(null);
      
      const authToken = getAuthToken();
      if (!authToken) {
        setSubscriptionError("User authentication required");
        setIsLoadingSubscription(false);
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: authToken
        }
      });
      
      if (error) {
        console.error("Error checking subscription:", error);
        setSubscriptionError("Could not check subscription status. Please try again.");
        toast({
          title: "Error",
          description: "Could not check subscription status. Please try again.",
          variant: "destructive"
        });
      } else {
        console.log("Subscription data received:", data);
        setSubscription(data);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      setSubscriptionError("Could not check subscription status. Please try again.");
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  const handleUpgrade = async (plan: 'pro' | 'enterprise' = 'pro') => {
    try {
      setUpgradingPlan(true);
      
      const authToken = getAuthToken();
      if (!authToken) {
        toast({
          title: "Error",
          description: "User authentication required",
          variant: "destructive"
        });
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan },
        headers: {
          Authorization: authToken
        }
      });

      if (error) {
        console.error("Checkout error:", error);
        toast({
          title: "Error",
          description: "Could not start upgrade process. Please try again.",
          variant: "destructive"
        });
        throw error;
      }
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Could not process subscription. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUpgradingPlan(false);
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
              
              {/* Upgrade button for free users */}
              {subscription && !subscription.subscribed && !isLoadingSubscription && (
                <Button 
                  onClick={() => handleUpgrade('pro')}
                  className="bg-medical-600 hover:bg-medical-700"
                  disabled={upgradingPlan}
                >
                  {upgradingPlan ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowUpCircle className="mr-2 h-4 w-4" />
                      Upgrade to Pro
                    </>
                  )}
                </Button>
              )}
              
              {/* Refresh button for subscription status */}
              {hasCompletedOnboarding && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={checkSubscription}
                  disabled={isLoadingSubscription}
                  className="ml-2"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingSubscription ? 'animate-spin' : ''}`} />
                  {isLoadingSubscription ? 'Checking...' : 'Refresh Status'}
                </Button>
              )}
            </div>
            
            {/* Subscription error message */}
            {subscriptionError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {subscriptionError}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={checkSubscription} 
                    className="ml-2"
                    disabled={isLoadingSubscription}
                  >
                    Try Again
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Subscription status */}
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
                <div className="mt-4">
                  <Button 
                    onClick={() => handleUpgrade('pro')}
                    className="bg-medical-600 hover:bg-medical-700 mr-3"
                    size="sm"
                    disabled={upgradingPlan}
                  >
                    Upgrade to Pro
                  </Button>
                  <Button 
                    onClick={() => handleUpgrade('enterprise')}
                    variant="outline"
                    size="sm"
                    disabled={upgradingPlan}
                  >
                    Upgrade to Enterprise
                  </Button>
                </div>
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

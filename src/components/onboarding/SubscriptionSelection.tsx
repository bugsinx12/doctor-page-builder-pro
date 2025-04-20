
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@clerk/clerk-react';
import { supabase } from "@/integrations/supabase/client";

// This would come from your Supabase/API in a real app
const pricingPlans = [
  {
    id: 'free',
    title: 'Free',
    price: 'Free',
    description: 'For individuals just getting started',
    features: [
      { text: '1 website', included: true },
      { text: 'Basic templates', included: true },
      { text: 'DocPages subdomain', included: true },
      { text: 'SSL Certificate', included: true },
      { text: 'Limited customization', included: true },
      { text: 'Custom domain', included: false },
      { text: 'Premium templates', included: false },
      { text: 'Analytics', included: false },
      { text: 'Priority support', included: false },
    ],
  },
  {
    id: 'pro',
    title: 'Pro',
    price: '$19',
    description: 'Perfect for established practices',
    features: [
      { text: '1 website', included: true },
      { text: 'Basic templates', included: true },
      { text: 'DocPages subdomain', included: true },
      { text: 'SSL Certificate', included: true },
      { text: 'Full customization', included: true },
      { text: 'Custom domain', included: true },
      { text: 'Premium templates', included: true },
      { text: 'Analytics', included: true },
      { text: 'Priority support', included: false },
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    title: 'Enterprise',
    price: '$49',
    description: 'For larger medical practices',
    features: [
      { text: 'Up to 5 websites', included: true },
      { text: 'All templates', included: true },
      { text: 'DocPages subdomain', included: true },
      { text: 'SSL Certificate', included: true },
      { text: 'Full customization', included: true },
      { text: 'Custom domains', included: true },
      { text: 'Premium templates', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Priority support', included: true },
    ],
  },
];

interface SubscriptionSelectionProps {
  onComplete: () => void;
  onPrevious: () => void;
}

const SubscriptionSelection = ({ 
  onComplete, 
  onPrevious 
}: SubscriptionSelectionProps) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('free');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

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

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      // For free plan, just complete onboarding
      if (selectedPlan === 'free') {
        // Save selected plan to user metadata
        await user?.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            plan: selectedPlan,
            onboardingCompleted: true
          },
        });
        onComplete();
        return;
      }

      // For paid plans, redirect to Stripe checkout
      toast({
        title: "Redirecting to checkout",
        description: "You'll be redirected to complete your payment securely.",
      });
      
      try {
        // First mark onboarding as completed before redirecting
        await user?.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            plan: selectedPlan,
            onboardingCompleted: true
          },
        });
        
        const authToken = getAuthToken();
        if (!authToken) {
          throw new Error("User authentication required");
        }
        
        console.log("Creating checkout session for plan:", selectedPlan);
        
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: { 
            plan: selectedPlan as 'pro' | 'enterprise'
          },
          headers: {
            Authorization: authToken
          }
        });

        if (error) {
          console.error('Checkout error:', error);
          throw new Error('Could not create checkout session');
        }

        console.log("Checkout response:", data);
        
        if (data?.url) {
          console.log("Redirecting to checkout URL:", data.url);
          // Complete onboarding first so user can use the app even if checkout is canceled
          onComplete();
          // Then redirect to Stripe checkout
          window.location.href = data.url;
        } else if (data?.error) {
          throw new Error(data.error);
        } else {
          throw new Error('No checkout URL returned');
        }
      } catch (error) {
        console.error('Error creating checkout:', error);
        // Complete onboarding even if checkout fails
        onComplete();
        throw error;
      }
    } catch (error) {
      console.error('Error during subscription selection:', error);
      toast({
        title: "Something went wrong",
        description: "Unable to process your request. Please try again.",
        variant: "destructive"
      });
      
      // For safety, mark onboarding as completed even on error
      try {
        await user?.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            plan: 'free', // Fallback to free plan on error
            onboardingCompleted: true
          },
        });
        onComplete();
      } catch (updateError) {
        console.error('Error updating user metadata:', updateError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Choose Your Plan</h2>
      <p className="text-gray-600 mb-8">
        Select the plan that fits your practice's needs. You can change or cancel anytime.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {pricingPlans.map((plan) => (
          <div 
            key={plan.id}
            className={`rounded-lg border bg-card shadow-sm overflow-hidden cursor-pointer transition-all
              ${selectedPlan === plan.id ? 'ring-2 ring-medical-600 shadow-md' : ''}
              ${plan.popular ? 'border-medical-500' : 'border-gray-200'}
            `}
            onClick={() => handlePlanSelect(plan.id)}
          >
            {plan.popular && (
              <div className="bg-medical-500 py-1 text-center text-sm font-medium text-white">
                Most Popular
              </div>
            )}
            
            <div className="p-6">
              <h3 className="text-xl font-semibold text-card-foreground">{plan.title}</h3>
              
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                {plan.price !== 'Free' && (
                  <span className="ml-1 text-sm font-medium text-muted-foreground">
                    /month
                  </span>
                )}
              </div>
              
              <p className="mt-2 text-sm text-muted-foreground">
                {plan.description}
              </p>
            </div>
            
            <div className="px-6 pb-6">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className={`mr-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full
                      ${feature.included ? "bg-medical-50 text-medical-600" : "bg-gray-50 text-gray-400"}
                    `}>
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span className={`text-sm
                      ${feature.included ? "text-gray-700" : "text-gray-400 line-through"}
                    `}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPrevious}
          disabled={isLoading}
        >
          Back
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            selectedPlan === 'free' ? 'Start Free Plan' : 'Continue to Payment'
          )}
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionSelection;

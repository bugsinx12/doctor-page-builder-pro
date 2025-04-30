
import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useSubscriptionCheckout() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

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

  const handlePlanSelection = async (selectedPlan: string) => {
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
        return { success: true, checkout: false };
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
          return { success: true, checkout: true, url: data.url };
        } else if (data?.error) {
          throw new Error(data.error);
        } else {
          throw new Error('No checkout URL returned');
        }
      } catch (error) {
        console.error('Error creating checkout:', error);
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
        return { success: true, checkout: false, error: true };
      } catch (updateError) {
        console.error('Error updating user metadata:', updateError);
        return { success: false, checkout: false, error: true };
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { handlePlanSelection, isLoading };
}


import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useSubscriptionCheckout() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Create auth data for Supabase edge functions
  const getAuthToken = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      
      // Return the JWT token
      return `Bearer ${session.access_token}`;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  };

  const handlePlanSelection = async (selectedPlan: string) => {
    setIsLoading(true);
    try {
      // For free plan, just complete onboarding
      if (selectedPlan === 'free') {
        // Save selected plan to user metadata in profiles table
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          throw new Error("User not authenticated");
        }

        // Update user profile with plan info
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            plan: selectedPlan,
            onboarding_completed: true
          })
          .eq('id', session.user.id);

        if (updateError) throw updateError;
        return { success: true, checkout: false };
      }

      // For paid plans, redirect to Stripe checkout
      toast({
        title: "Redirecting to checkout",
        description: "You'll be redirected to complete your payment securely.",
      });
      
      try {
        // First mark onboarding as completed before redirecting
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          throw new Error("User authentication required");
        }
        
        // Update user profile with plan info
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            plan: selectedPlan,
            onboarding_completed: true
          })
          .eq('id', session.user.id);
        
        if (updateError) throw updateError;
        
        const authToken = await getAuthToken();
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
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Update user profile with default free plan on error
          await supabase
            .from('profiles')
            .update({
              plan: 'free',
              onboarding_completed: true
            })
            .eq('id', session.user.id);
        }
        
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

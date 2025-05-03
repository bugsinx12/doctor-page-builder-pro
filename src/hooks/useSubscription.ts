
import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react"; // Added useAuth
import { useToast } from "@/components/ui/use-toast";
import { useAuthenticatedSupabase } from "@/hooks/useAuthenticatedSupabase"; // Use the new hook
import type { Database } from "@/integrations/supabase/types";

type Subscriber = Database['public']['Tables']['subscribers']['Row'];
type SubscriberInsert = Database['public']['Tables']['subscribers']['Insert'];

interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

export const useSubscription = () => {
  const { user } = useUser();
  const { userId } = useAuth(); // Get userId directly
  const { client: supabase, isLoading: authLoading, isAuthenticated, error: authError } = useAuthenticatedSupabase(); // Use the authenticated client
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (!userId || !user || !isAuthenticated || authLoading) { // Wait for auth to load too
      setIsLoading(false);
      return;
    }

    const checkSubscription = async () => {
      try {
        setIsLoading(true);
        console.log("Checking subscription for user ID:", userId);

        // Use the user's Clerk ID directly
        // First, check if subscriber exists in Supabase using the authenticated client
        const { data: existingSubscriber, error: fetchError } = await supabase
          .from("subscribers")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching subscriber:", fetchError);
          // Potentially throw or handle error based on severity
        }

        // If no subscriber exists, create one
        if (!existingSubscriber) {
          console.log("No subscriber found, creating new record");
          const subscriberData: SubscriberInsert = {
            user_id: userId,
            email: user.primaryEmailAddress?.emailAddress || "",
            subscribed: false
          };
          
          const { data: newSubscriber, error: insertError } = await supabase
            .from("subscribers")
            .insert(subscriberData)
            .select()
            .single();

          if (insertError) {
            console.error("Error creating subscriber:", insertError);
          } else {
            console.log("Created new subscriber:", newSubscriber);
          }
        } else {
          console.log("Found existing subscriber:", existingSubscriber);
          // Use the existing data while we wait for the API check
          if (existingSubscriber) {
            setSubscriptionStatus(prev => ({ // Update state based on previous state if needed
              subscribed: existingSubscriber.subscribed,
              subscription_tier: existingSubscriber.subscription_tier,
              subscription_end: existingSubscriber.subscription_end,
            });
          }
        }

        // Check subscription status from edge function (if implemented)
        // NOTE: The edge function invocation needs to rely on the TPA token
        // injected by the useAuthenticatedSupabase client's fetch wrapper,
        // not the custom btoa token.
        try {
          console.log("Calling check-subscription edge function");
          const { data, error } = await supabase.functions.invoke('check-subscription', {
          });

          if (error) {
            console.error("Error calling check-subscription:", error);
            throw error;
          }

          console.log("Subscription check response:", data);
          if (data) {
            setSubscriptionStatus({
              subscribed: data.subscribed || false,
              subscription_tier: data.subscription_tier,
              subscription_end: data.subscription_end,
            });
          }
        } catch (apiError) {
          console.error("API subscription check error:", apiError);
          toast({
            title: "Subscription Check Error",
            description: "Unable to verify your subscription status from our server.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error in subscription check:", error);
        toast({
          title: "Subscription Error",
          description: "Unable to verify your subscription status.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [
      userId,
      user,
      toast,
      isAuthenticated,
      authLoading, // Add authLoading dependency
      supabase // Add supabase client dependency
    ]
  );

  return { subscriptionStatus, isLoading: isLoading || authLoading };
};

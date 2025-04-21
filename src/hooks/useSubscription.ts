
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "./useSupabaseAuth";

interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

export const useSubscription = () => {
  const { user } = useUser();
  const { supabaseUserId, isLoading: authLoading } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (!supabaseUserId || !user) {
      setIsLoading(false);
      return;
    }

    const checkSubscription = async () => {
      try {
        setIsLoading(true);

        const { data: existingSubscriber, error: fetchError } = await supabase
          .from("subscribers")
          .select("*")
          .eq("user_id", supabaseUserId)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (!existingSubscriber) {
          const subscriberData = {
            user_id: supabaseUserId,
            email: user.primaryEmailAddress?.emailAddress || "",
            subscribed: false
          };
          
          const { error: insertError } = await supabase
            .from("subscribers")
            .insert(subscriberData);
            
          if (insertError) throw insertError;
        } else {
          setSubscriptionStatus({
            subscribed: existingSubscriber.subscribed || false,
            subscription_tier: existingSubscriber.subscription_tier,
            subscription_end: existingSubscriber.subscription_end,
          });
        }

        // Check subscription status from edge function if available
        try {
          const authData = {
            userId: supabaseUserId,
            userEmail: user.primaryEmailAddress?.emailAddress
          };
          const authToken = btoa(JSON.stringify(authData));

          const response = await fetch("/api/check-subscription", {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setSubscriptionStatus({
              subscribed: data.subscribed,
              subscription_tier: data.subscription_tier,
              subscription_end: data.subscription_end,
            });
          }
        } catch (apiError) {
          console.log("API subscription check skipped or failed:", apiError);
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
  }, [supabaseUserId, user, toast]);

  return { subscriptionStatus, isLoading: isLoading || authLoading };
};

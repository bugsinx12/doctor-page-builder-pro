
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
        console.log("Checking subscription for user ID:", supabaseUserId);

        // Check if subscriber exists
        const { data: existingSubscriber, error: fetchError } = await supabase
          .from("subscribers")
          .select("*")
          .eq("user_id", supabaseUserId)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (existingSubscriber) {
          console.log("Found existing subscriber:", existingSubscriber);
          // Subscriber exists, use it
          setSubscriptionStatus({
            subscribed: existingSubscriber.subscribed || false,
            subscription_tier: existingSubscriber.subscription_tier,
            subscription_end: existingSubscriber.subscription_end,
          });
          
          // Update email if needed
          if (existingSubscriber.email !== user.primaryEmailAddress?.emailAddress) {
            console.log("Updating subscriber email");
            const { error: updateError } = await supabase
              .from("subscribers")
              .update({ email: user.primaryEmailAddress?.emailAddress })
              .eq("user_id", supabaseUserId);
              
            if (updateError) {
              console.error("Error updating subscriber email:", updateError);
            }
          }
        } else {
          console.log("No subscriber found, creating new record");
          // Subscriber doesn't exist, create it
          const subscriberData = {
            user_id: supabaseUserId,
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
            throw insertError;
          }
          console.log("Created new subscriber:", newSubscriber);
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

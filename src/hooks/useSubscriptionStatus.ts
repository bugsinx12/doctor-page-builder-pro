
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import getUUIDFromClerkID from "@/utils/getUUIDFromClerkID";

export const useSubscriptionStatus = () => {
  const { userId } = useAuth();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    subscribed: boolean;
    subscription_tier: string | null;
    subscription_end: string | null;
  }>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (!userId || !user) {
      setIsLoading(false);
      return;
    }

    const checkSubscription = async () => {
      try {
        setIsLoading(true);
        const supabaseUserId = getUUIDFromClerkID(userId);

        // First, check if subscriber record exists
        const { data: existingSubscriber, error: fetchError } = await supabase
          .from("subscribers")
          .select("*")
          .eq("user_id", supabaseUserId)
          .maybeSingle();

        if (fetchError) {
          console.error("Error checking subscriber:", fetchError);
        }

        // If subscriber doesn't exist, create it
        if (!existingSubscriber) {
          const subscriberData = {
            user_id: supabaseUserId,
            email: user.primaryEmailAddress?.emailAddress || "",
            subscribed: false
          };
          
          const { error: insertError } = await supabase
            .from("subscribers")
            .insert(subscriberData);
            
          if (insertError) {
            console.error("Error creating subscriber record:", insertError);
          } else {
            console.log("Subscriber record created successfully");
          }
        } else {
          console.log("Subscriber record found:", existingSubscriber);
          
          // If we found a subscription record, update the state
          setSubscriptionStatus({
            subscribed: existingSubscriber.subscribed || false,
            subscription_tier: existingSubscriber.subscription_tier,
            subscription_end: existingSubscriber.subscription_end,
          });
        }

        // We'll still try to fetch subscription from edge function if it exists
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
          // Fall back to the data we already have from the database
        }
      } catch (error) {
        console.error("Error in subscription check:", error);
        toast({
          title: "Subscription Check Failed",
          description: "Unable to verify your subscription status.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [userId, user, toast]);

  return { subscriptionStatus, isLoading };
};

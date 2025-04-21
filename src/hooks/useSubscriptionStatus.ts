
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
    if (!userId || !user) return;

    const checkSubscription = async () => {
      try {
        setIsLoading(true);

        const supabaseUserId = getUUIDFromClerkID(userId);

        const { data: existingSubscriber, error: fetchError } = await supabase
          .from("subscribers")
          .select("*")
          .eq("user_id", supabaseUserId)
          .maybeSingle();

        if (!existingSubscriber) {
          const subscriberData = {
            user_id: supabaseUserId,
            email: user.primaryEmailAddress?.emailAddress || "",
            subscribed: false
          };
          await supabase.from("subscribers").insert(subscriberData);
        }

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

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setSubscriptionStatus({
          subscribed: data.subscribed,
          subscription_tier: data.subscription_tier,
          subscription_end: data.subscription_end,
        });
      } catch (error) {
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

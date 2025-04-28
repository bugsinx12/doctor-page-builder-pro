
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/utils/supabaseAuth";
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

        // First, check if subscriber exists in Supabase
        const { data: existingSubscriber, error: fetchError } = await supabase
          .from("subscribers")
          .select("*")
          .eq("user_id", supabaseUserId)
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching subscriber:", fetchError);
        }

        // If no subscriber exists, create one
        if (!existingSubscriber) {
          console.log("No subscriber found, creating new record");
          const subscriberData: SubscriberInsert = {
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
          } else {
            console.log("Created new subscriber:", newSubscriber);
          }
        } else {
          console.log("Found existing subscriber:", existingSubscriber);
          // Use the existing data while we wait for the API check
          if (existingSubscriber) {
            setSubscriptionStatus({
              subscribed: existingSubscriber.subscribed,
              subscription_tier: existingSubscriber.subscription_tier,
              subscription_end: existingSubscriber.subscription_end,
            });
          }
        }

        // Check subscription status from edge function
        try {
          const authData = {
            userId: supabaseUserId,
            userEmail: user.primaryEmailAddress?.emailAddress
          };
          const authToken = btoa(JSON.stringify(authData));

          console.log("Calling check-subscription edge function");
          const { data, error } = await supabase.functions.invoke('check-subscription', {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
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
  }, [supabaseUserId, user, toast]);

  return { subscriptionStatus, isLoading: isLoading || authLoading };
};

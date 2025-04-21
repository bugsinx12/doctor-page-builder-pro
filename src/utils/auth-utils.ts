
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';

// Helper function to convert Clerk ID to a valid UUID for Supabase
export const getUUIDFromClerkID = (clerkId: string): string => {
  // Check if the ID is already a valid UUID
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidPattern.test(clerkId)) {
    return clerkId;
  }
  
  // If not a valid UUID, generate a deterministic UUID based on the Clerk ID
  // We use a hash of the Clerk ID to maintain consistency
  let hash = 0;
  for (let i = 0; i < clerkId.length; i++) {
    const char = clerkId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert the hash to a seed array of 16 bytes for UUID v4
  const seed = new Uint8Array(16);
  const absHash = Math.abs(hash);
  for (let i = 0; i < 16; i++) {
    seed[i] = (absHash >> ((i % 4) * 8)) & 0xff;
  }

  return uuidv4({ random: Array.from(seed) });
};

export const useSyncUserProfile = () => {
  const { userId } = useAuth();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<{
    practice_name: string | null;
    specialty: string | null;
    avatar_url: string | null;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId || !user) return;

    const syncProfile = async () => {
      try {
        setIsLoading(true);
        
        // Generate a UUID for Supabase based on the Clerk userId
        const supabaseUserId = getUUIDFromClerkID(userId);
        console.log("Checking for existing profile for Supabase user ID:", supabaseUserId);
        
        // Check if profile exists
        const { data: existingProfile, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", supabaseUserId)
          .maybeSingle();

        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("Error checking profile:", fetchError);
          toast({
            title: "Error",
            description: "Could not check your profile. Please try again.",
            variant: "destructive",
          });
          return;
        }

        // If profile doesn't exist, create one with retry logic
        if (!existingProfile) {
          console.log("Creating new profile for user:", supabaseUserId);
          let retryCount = 0;
          const maxRetries = 3;
          let success = false;

          while (retryCount < maxRetries && !success) {
            try {
              // Log the exact data being inserted
              const profileData = {
                id: supabaseUserId,
                full_name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
                avatar_url: user.imageUrl || null,
              };
              console.log("Inserting profile data:", profileData);
              
              const { error: insertError } = await supabase.from("profiles").insert(profileData);

              if (insertError) {
                console.error(`Attempt ${retryCount + 1}: Error creating profile:`, insertError);
                retryCount++;
                if (retryCount === maxRetries) {
                  toast({
                    title: "Profile Creation Error",
                    description: "Could not create your profile. Some features may be limited.",
                    variant: "destructive",
                  });
                }
                // Wait before retrying
                await new Promise((resolve) => setTimeout(resolve, 1000));
              } else {
                success = true;
                console.log("Profile created successfully");
                // Fetch the newly created profile
                const { data: newProfile } = await supabase
                  .from("profiles")
                  .select("*")
                  .eq("id", supabaseUserId)
                  .maybeSingle();
                
                if (newProfile) {
                  setProfile(newProfile);
                }
              }
            } catch (error) {
              console.error(`Attempt ${retryCount + 1}: Unexpected error:`, error);
              retryCount++;
            }
          }
        } else {
          console.log("Existing profile found:", existingProfile);
          setProfile(existingProfile);
        }
      } catch (error) {
        console.error("Error syncing profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    syncProfile();
  }, [userId, user, toast]);

  return { profile, isLoading };
};

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
        
        // Generate UUID for Supabase based on Clerk userId
        const supabaseUserId = getUUIDFromClerkID(userId);
        console.log("Using Supabase User ID for subscription:", supabaseUserId);
        
        // Check if subscriber record exists first
        const { data: existingSubscriber, error: fetchError } = await supabase
          .from("subscribers")
          .select("*")
          .eq("user_id", supabaseUserId)
          .maybeSingle();
          
        if (fetchError) {
          console.error("Error checking subscriber:", fetchError);
        }
        
        // If no subscriber record exists, create one with basic info
        if (!existingSubscriber) {
          console.log("Creating new subscriber record for:", supabaseUserId);
          
          const subscriberData = {
            user_id: supabaseUserId,
            email: user.primaryEmailAddress?.emailAddress || "",
            subscribed: false
          };
          console.log("Inserting subscriber data:", subscriberData);
          
          const { error: insertError } = await supabase
            .from("subscribers")
            .insert(subscriberData);
            
          if (insertError) {
            console.error("Error creating subscriber record:", insertError);
          } else {
            console.log("Subscriber record created successfully");
          }
        } else {
          console.log("Existing subscriber found:", existingSubscriber);
        }
        
        // Create an auth token that includes the necessary user info
        const authData = {
          userId: supabaseUserId,
          userEmail: user.primaryEmailAddress?.emailAddress
        };
        
        // Base64 encode the data
        const authToken = btoa(JSON.stringify(authData));

        const response = await fetch("/api/check-subscription", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          console.error("Failed to check subscription:", response.statusText);
          return;
        }

        const data = await response.json();
        console.log("Subscription data:", data);
        
        setSubscriptionStatus({
          subscribed: data.subscribed,
          subscription_tier: data.subscription_tier,
          subscription_end: data.subscription_end,
        });
      } catch (error) {
        console.error("Error checking subscription:", error);
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


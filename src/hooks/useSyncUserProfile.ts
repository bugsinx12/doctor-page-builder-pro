
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import getUUIDFromClerkID from "@/utils/getUUIDFromClerkID";

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
    if (!userId || !user) {
      console.log("No user ID or user object available");
      return;
    }

    const syncProfile = async () => {
      try {
        setIsLoading(true);
        const supabaseUserId = getUUIDFromClerkID(userId);

        const { data: existingProfile, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", supabaseUserId)
          .maybeSingle();

        if (fetchError && fetchError.code !== "PGRST116") {
          toast({
            title: "Error",
            description: "Could not check your profile. Please try again.",
            variant: "destructive",
          });
          return;
        }

        // If profile doesn't exist, create one with retry logic
        if (!existingProfile) {
          let retryCount = 0;
          const maxRetries = 3;
          let success = false;

          while (retryCount < maxRetries && !success) {
            try {
              const profileData = {
                id: supabaseUserId,
                full_name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
                avatar_url: user.imageUrl || null,
              };

              const { data: insertData, error: insertError } = await supabase
                .from("profiles")
                .insert(profileData)
                .select();

              if (insertError) {
                retryCount++;
                if (retryCount === maxRetries) {
                  toast({
                    title: "Profile Creation Error",
                    description: "Could not create your profile. Some features may be limited.",
                    variant: "destructive",
                  });
                }
                await new Promise((resolve) => setTimeout(resolve, 1000));
              } else {
                success = true;
                const { data: newProfile } = await supabase
                  .from("profiles")
                  .select("*")
                  .eq("id", supabaseUserId)
                  .maybeSingle();
                if (newProfile) setProfile(newProfile);
              }
            } catch (error) {
              retryCount++;
            }
          }
        } else {
          setProfile(existingProfile);
        }
      } catch (error) {
        // log and fall through
      } finally {
        setIsLoading(false);
      }
    };

    syncProfile();
  }, [userId, user, toast]);

  return { profile, isLoading };
};

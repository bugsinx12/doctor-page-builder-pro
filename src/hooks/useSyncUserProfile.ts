
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
      setIsLoading(false);
      return;
    }

    const syncProfile = async () => {
      try {
        setIsLoading(true);
        const supabaseUserId = getUUIDFromClerkID(userId);

        // First, make sure the user profile exists
        const { data: existingProfile, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", supabaseUserId)
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching profile:", fetchError);
          toast({
            title: "Error",
            description: "Could not check your profile. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // If profile doesn't exist, create it through direct insert
        if (!existingProfile) {
          const profileData = {
            id: supabaseUserId,
            full_name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
            avatar_url: user.imageUrl || null,
          };

          const { error: insertError } = await supabase
            .from("profiles")
            .insert(profileData);

          if (insertError) {
            console.error("Error creating profile:", insertError);
            toast({
              title: "Profile Creation Error",
              description: "Could not create your profile. Some features may be limited.",
              variant: "destructive",
            });
          } else {
            console.log("Profile created successfully");
            
            // Get the newly created profile
            const { data: newProfile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", supabaseUserId)
              .maybeSingle();
              
            if (newProfile) setProfile(newProfile);
          }
        } else {
          console.log("Profile found:", existingProfile);
          setProfile(existingProfile);
        }
      } catch (error) {
        console.error("Unexpected error in profile sync:", error);
      } finally {
        setIsLoading(false);
      }
    };

    syncProfile();
  }, [userId, user, toast]);

  return { profile, isLoading };
};
